import { useState, useCallback, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Button, LinearProgress, Alert, AlertTitle } from "@mui/material";
import { BiUpload, BiDownload } from "react-icons/bi";
import { MdClear, MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { bulkSearchPhonesByIMEI } from "../services/services";

const IMEIQuery = () => {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedData, setProcessedData] = useState(null);
    const [progress, setProgress] = useState(0);
    const [stats, setStats] = useState(null);
    const [errors, setErrors] = useState([]);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isCancelled, setIsCancelled] = useState(false);

    const token = useSelector((state) => state.userSlice.user.token);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const cancelTokenRef = useRef(null);

    // Timer functions
    const startTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        setElapsedTime(0);

        timerRef.current = setInterval(() => {
            if (startTimeRef.current) {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                setElapsedTime(elapsed);
            }
        }, 1000);
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        startTimeRef.current = null;
    }, []);

    const formatTime = useCallback((seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    // Cancel processing
    const cancelProcessing = useCallback(() => {
        if (cancelTokenRef.current) {
            cancelTokenRef.current.abort();
        }
        setIsCancelled(true);
        setIsProcessing(false);
        stopTimer();
        setProgress(0);
        toast.info("Processing cancelled by user");
    }, [stopTimer]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);
    // Handle file upload
    const handleFileUpload = useCallback((event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) return;

        // Validate file type
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!validTypes.includes(selectedFile.type)) {
            toast.error("Please upload a valid Excel file (.xlsx or .xls)");
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB");
            return;
        }

        setFile(selectedFile);
        setProcessedData(null);
        setStats(null);
        setErrors([]);
        setElapsedTime(0);
        setIsCancelled(false);
        toast.success("File uploaded successfully");
    }, []);

    // Process Excel file and query database
    const processFile = useCallback(async () => {
        if (!file || !token) {
            toast.error("Please select a file first");
            return;
        }

        setIsProcessing(true);
        setProgress(0);
        setErrors([]);
        setIsCancelled(false);

        // Start timer
        startTimer();

        // Create cancel token
        cancelTokenRef.current = new AbortController();

        try {
            // Read Excel file
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, {
                cellStyles: true,
                cellFormulas: true,
                cellDates: true
            });

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: ""
            });

            if (jsonData.length < 2) {
                throw new Error("Excel file must contain at least a header row and one data row");
            }

            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            // Find IMEI column (case-insensitive)
            const imeiColumnIndex = headers.findIndex(header =>
                header && header.toString().toLowerCase().includes('imei')
            );

            if (imeiColumnIndex === -1) {
                throw new Error("IMEI column not found in Excel file. Please ensure there's a column with 'IMEI' in the header.");
            }

            // Add new columns for Manager Name and Region if they don't exist
            const managerNameIndex = headers.findIndex(header =>
                header && header.toString().toLowerCase().includes('manager')
            );
            const regionIndex = headers.findIndex(header =>
                header && header.toString().toLowerCase().includes('region') ||
                header && header.toString().toLowerCase().includes('location')
            );

            if (managerNameIndex === -1) {
                headers.push('Manager Name');
            }
            if (regionIndex === -1) {
                headers.push('Region');
            }

            const newManagerIndex = managerNameIndex === -1 ? headers.length - 2 : managerNameIndex;
            const newRegionIndex = regionIndex === -1 ? headers.length - 1 : regionIndex;

            // Extract all IMEIs first
            const imeiData = rows.map((row, index) => ({
                rowIndex: index,
                imei: row[imeiColumnIndex]?.toString().trim() || "",
                originalRow: [...row]
            }));

            // Separate valid IMEIs from invalid ones
            const validIMEIs = imeiData.filter(item => item.imei).map(item => item.imei);
            const invalidIMEIs = imeiData.filter(item => !item.imei);

            setProgress(20); // 20% - Data extraction complete

            let bulkResults = [];
            const failedIMEIs = [];

            // Process invalid IMEIs
            invalidIMEIs.forEach(item => {
                failedIMEIs.push({
                    row: item.rowIndex + 2,
                    imei: "Empty",
                    reason: "No IMEI provided"
                });
            });

            // Split large datasets into smaller chunks for processing
            const CHUNK_SIZE = 2000; // Process 2000 IMEIs at a time
            const chunks = [];

            for (let i = 0; i < validIMEIs.length; i += CHUNK_SIZE) {
                chunks.push(validIMEIs.slice(i, i + CHUNK_SIZE));
            }

            let allResults = [];

            // Process chunks if we have valid IMEIs
            if (chunks.length > 0 && !isCancelled) {
                try {
                    setProgress(30); // 30% - Starting bulk query

                    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                        if (isCancelled) break;

                        const chunk = chunks[chunkIndex];

                        try {
                            const bulkResponse = await bulkSearchPhonesByIMEI({
                                imeis: chunk,
                                token,
                                signal: cancelTokenRef.current?.signal
                            });

                            // Check if cancelled after API call
                            if (isCancelled) {
                                return;
                            }

                            allResults = allResults.concat(bulkResponse.results || []);

                            // Update progress based on chunks processed
                            const chunkProgress = 30 + ((chunkIndex + 1) / chunks.length) * 50;
                            setProgress(chunkProgress);

                            // Small delay between chunks to prevent overwhelming
                            if (chunkIndex < chunks.length - 1) {
                                await new Promise(resolve => setTimeout(resolve, 200));
                            }

                        } catch (chunkError) {
                            console.error(`Error processing chunk ${chunkIndex + 1}:`, chunkError);

                            // Mark this chunk's IMEIs as failed
                            chunk.forEach(imei => {
                                const item = imeiData.find(i => i.imei === imei);
                                if (item) {
                                    failedIMEIs.push({
                                        row: item.rowIndex + 2,
                                        imei,
                                        reason: `Chunk ${chunkIndex + 1} failed: ${chunkError.message}`
                                    });
                                }
                            });
                        }
                    }

                    bulkResults = allResults;
                    setProgress(80); // 80% - All chunks processed

                } catch (error) {
                    // Check if error is due to cancellation
                    if (error.name === 'AbortError' || isCancelled) {
                        return;
                    }

                    console.error("Bulk IMEI search failed:", error);
                    toast.error("Bulk IMEI search failed: " + error.message);

                    // Mark all valid IMEIs as failed
                    validIMEIs.forEach(imei => {
                        const item = imeiData.find(i => i.imei === imei);
                        if (item) {
                            failedIMEIs.push({
                                row: item.rowIndex + 2,
                                imei,
                                reason: error.message || "Bulk query failed"
                            });
                        }
                    });
                }
            }

            // Create a map for fast IMEI lookup
            const imeiResultMap = new Map();
            bulkResults.forEach(result => {
                imeiResultMap.set(result.imei, result);
            });

            // Process all rows and populate manager/region data
            const processedRows = [];
            let successCount = 0;

            imeiData.forEach(item => {
                const row = [...item.originalRow];

                // Ensure row has enough columns
                while (row.length < headers.length) {
                    row.push("");
                }

                if (!item.imei) {
                    // Handle empty IMEI
                    row[newManagerIndex] = "No IMEI";
                    row[newRegionIndex] = "No IMEI";
                } else {
                    // Look up result from bulk query
                    const result = imeiResultMap.get(item.imei);

                    if (result && result.found && result.phone) {
                        const phone = result.phone;
                        const managerName = phone.manager
                            ? phone.manager.name || "No Manager"
                            : "No Manager";
                        const region = phone.manager?.region?.location || "No Region";

                        row[newManagerIndex] = managerName;
                        row[newRegionIndex] = region;
                        successCount++;
                    } else {
                        row[newManagerIndex] = "Not Found";
                        row[newRegionIndex] = "Not Found";
                        failedIMEIs.push({
                            row: item.rowIndex + 2,
                            imei: item.imei,
                            reason: "IMEI not found in database"
                        });
                    }
                }

                processedRows.push(row);
            });

            setProgress(95); // 95% - Row processing complete

            // Check if cancelled before final processing
            if (isCancelled) {
                return;
            }

            // Create new workbook with processed data
            const newWorkbook = XLSX.utils.book_new();
            const newWorksheet = XLSX.utils.aoa_to_sheet([headers, ...processedRows]);

            // Auto-size columns
            const colWidths = headers.map(header => ({ wch: Math.max(header.length, 15) }));
            newWorksheet['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);

            setProcessedData(newWorkbook);
            setStats({
                total: rows.length,
                successful: successCount,
                failed: failedIMEIs.length
            });
            setErrors(failedIMEIs);

            // Stop timer and show completion message
            stopTimer();

            if (!isCancelled) {
                toast.success(`Processing complete! ${successCount}/${rows.length} IMEIs processed successfully in ${formatTime(elapsedTime)}`);
            }

        } catch (error) {
            // Check if error is due to cancellation
            if (error.name === 'AbortError' || isCancelled) {
                return;
            }

            console.error("Error processing file:", error);
            toast.error(error.message || "Failed to process file");
            setErrors([{ row: "N/A", imei: "N/A", reason: error.message }]);
        } finally {
            if (!isCancelled) {
                setIsProcessing(false);
                setProgress(100);
            }
            stopTimer();
            cancelTokenRef.current = null;
        }
    }, [file, token, startTimer, stopTimer, formatTime, elapsedTime, isCancelled]);

    // Download processed file
    const downloadProcessedFile = useCallback(() => {
        if (!processedData) {
            toast.error("No processed data available");
            return;
        }

        try {
            const fileName = file.name.replace(/\.[^/.]+$/, "") + "_processed.xlsx";
            XLSX.writeFile(processedData, fileName);
            toast.success("File downloaded successfully");
        } catch (error) {
            console.error("Error downloading file:", error);
            toast.error("Failed to download file");
        }
    }, [processedData, file]);

    // Clear all data
    const clearData = useCallback(() => {
        setFile(null);
        setProcessedData(null);
        setStats(null);
        setErrors([]);
        setProgress(0);
        setElapsedTime(0);
        setIsProcessing(false);
        setIsCancelled(false);
        stopTimer();

        // Reset file input
        const fileInput = document.getElementById('excel-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    }, []);

    return (
        <div className="p-5">
            <div className="space-y-5">
                <div className="flex flex-row items-center justify-between">
                    <h1 className="text-xl font-bold">IMEI Query Tool</h1>
                    {(file || processedData) && (
                        <Button
                            onClick={clearData}
                            startIcon={<MdClear />}
                            variant="outlined"
                            color="secondary"
                            disabled={isProcessing}
                        >
                            Clear All
                        </Button>
                    )}
                </div>

                <div className="border border-gray-200 rounded-lg">
                    <div className="p-5 space-y-5">
                        {/* File Upload Section */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold">Upload Excel File</h2>
                            <div className="flex flex-col space-y-3">
                                <input
                                    id="excel-file-input"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    disabled={isProcessing}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="excel-file-input"
                                    className={`
                    flex flex-col items-center justify-center w-full h-32 
                    border-2 border-dashed rounded-lg cursor-pointer
                    ${isProcessing
                                            ? 'border-gray-300 bg-gray-50'
                                            : 'border-primary-300 bg-primary-50 hover:bg-primary-100'
                                        }
                    ${file ? 'border-green-300 bg-green-50' : ''}
                  `}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <BiUpload className={`w-8 h-8 mb-4 ${file ? 'text-green-500' : 'text-primary-500'}`} />
                                        <p className={`mb-2 text-sm ${file ? 'text-green-700' : 'text-primary-700'}`}>
                                            {file ? (
                                                <span className="font-semibold">{file.name}</span>
                                            ) : (
                                                <>
                                                    <span className="font-semibold">Click to upload</span> Excel file
                                                </>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">XLSX or XLS (MAX. 10MB)</p>
                                    </div>
                                </label>

                                {file && !isProcessing && (
                                    <div className="flex justify-center space-x-4">
                                        <Button
                                            onClick={processFile}
                                            variant="contained"
                                            className="bg-primary-500 hover:bg-primary-600"
                                            size="large"
                                        >
                                            Process File
                                        </Button>
                                    </div>
                                )}

                                {isProcessing && (
                                    <div className="flex justify-center">
                                        <Button
                                            onClick={cancelProcessing}
                                            variant="outlined"
                                            color="error"
                                            startIcon={<MdCancel />}
                                            size="large"
                                        >
                                            Cancel Processing
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Progress Section */}
                        {isProcessing && (
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Processing IMEIs...</span>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                                        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm font-medium text-blue-700">
                                                {formatTime(elapsedTime)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    className="h-2 rounded"
                                />
                                <p className="text-xs text-gray-500 text-center">
                                    Processing IMEIs in optimized chunks for better performance
                                </p>
                            </div>
                        )}

                        {/* Completion Time Display */}
                        {!isProcessing && stats && elapsedTime > 0 && (
                            <div className="bg-green-50 p-3 rounded-lg">
                                <div className="flex items-center justify-center space-x-2">
                                    <span className="text-green-700 font-medium">
                                        ✅ Completed in {formatTime(elapsedTime)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Stats Section */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                                    <div className="text-sm text-blue-800">Total IMEIs</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                                    <div className="text-sm text-green-800">Successfully Processed</div>
                                </div>
                                <div className="bg-red-50 p-4 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                                    <div className="text-sm text-red-800">Failed/Not Found</div>
                                </div>
                            </div>
                        )}

                        {/* Download Section */}
                        {processedData && (
                            <div className="flex justify-center">
                                <Button
                                    onClick={downloadProcessedFile}
                                    startIcon={<BiDownload />}
                                    variant="contained"
                                    color="success"
                                    size="large"
                                >
                                    Download Processed File
                                </Button>
                            </div>
                        )}

                        {/* Errors Section */}
                        {errors.length > 0 && (
                            <div className="space-y-3">
                                <Alert severity="warning">
                                    <AlertTitle>Processing Issues ({errors.length})</AlertTitle>
                                    The following IMEIs could not be processed:
                                </Alert>
                                <div className="max-h-60 overflow-y-auto border rounded-lg">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Row</th>
                                                <th className="px-3 py-2 text-left">IMEI</th>
                                                <th className="px-3 py-2 text-left">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {errors.map((error, index) => (
                                                <tr key={index} className="border-b hover:bg-gray-50">
                                                    <td className="px-3 py-2">{error.row}</td>
                                                    <td className="px-3 py-2 font-mono text-xs">{error.imei}</td>
                                                    <td className="px-3 py-2">{error.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Instructions */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
                            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                <li>Upload an Excel file containing IMEI numbers in any column with "IMEI" in the header</li>
                                <li>The system will process IMEIs in optimized chunks for better performance</li>
                                <li>Large files are automatically split into smaller batches to prevent timeouts</li>
                                <li>Manager Name and Region columns will be added/updated automatically</li>
                                <li>Download the processed file with all the populated data</li>
                                <li>Check the error report for any IMEIs that couldn't be processed</li>
                                <li><strong>Tip:</strong> For files with 10,000+ IMEIs, processing may take several minutes</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IMEIQuery;
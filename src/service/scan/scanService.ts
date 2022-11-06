import { CreateScanRequest } from "../server/requests/scanRequest";
import IScanService from "./interfaces/scanServiceInterface";
import { ScanRequestResponse } from "./types/scanRequest";
import { v4 as uuidv4 } from 'uuid';
import IScanStorage from "../../storage/scans/interfaces/scanStorageInterface";
import { ProbeStatus, ReportStatus } from "../../storage/scans/types/startData";

export default class ScanService implements IScanService {
    constructor(private readonly scanStorage: IScanStorage) { }

    async requestScan(scanRequest: CreateScanRequest): Promise<ScanRequestResponse> {
        const newReportId = uuidv4();

        // Assing uids to probes
        const probes = scanRequest.probes.map((probe) => {
            return {
                ...probe,
                uid: uuidv4()
            }
        })

        // Save start data in supabase
        await Promise.all([
            this.scanStorage.saveReportStartData({
                id: newReportId,
                status: ReportStatus.PENDING,
                notification: false,
            }),

            this.scanStorage.saveProbesStartData(probes.map((probe) => ({
                id: probe.uid,
                status: ProbeStatus.PENDING,
                reportId: newReportId
            })))
        ]);

        return { reportId: newReportId };
    }
}
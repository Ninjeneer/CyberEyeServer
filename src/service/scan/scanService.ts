import { CreateScanRequest } from "../server/requests/scanRequest";
import IScanService from "./interfaces/scanServiceInterface";
import { ScanRequestResponse } from "./types/scanRequest";
import { v4 as uuidv4 } from 'uuid';
import IScanStorage from "../../storage/scans/interfaces/scanStorageInterface";
import { ProbeStatus, ScanStatus } from "./types/startData";
import IMessageQueue from "../../storage/messagequeue/interfaces/messageQueueInterface";

export default class ScanService implements IScanService {
    constructor(private readonly scanStorage: IScanStorage, private readonly messageQueue: IMessageQueue) { }

    async requestScan(scanRequest: CreateScanRequest): Promise<ScanRequestResponse> {
        const newScanId = uuidv4();

        // Assing uids to probes
        const probes = scanRequest.probes.map((probe) => {
            return {
                ...probe,
                uid: uuidv4()
            }
        })

        // Save start data in supabase
        await this.scanStorage.saveScanStartData({
            id: newScanId,
            status: ScanStatus.PENDING,
            notification: false,
            target: scanRequest.target,
            periodicity: scanRequest.periodicity
        })

        await this.scanStorage.saveProbesStartData(probes.map((probe) => ({
            id: probe.uid,
            status: ProbeStatus.PENDING,
            scanId: newScanId,
        })))

        this.messageQueue.publishProbeRequest(probes.map((probe) => ({
            context: {
                id: probe.uid,
                name: probe.name,
                target: scanRequest.target
            },
            settings: probe.settings
        })));

        return { scanId: newScanId };
    }
}
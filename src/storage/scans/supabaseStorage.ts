import IScanStorage from "./interfaces/scanStorageInterface";
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { ProbeStartData, ScanStartData } from "../../service/scan/types/startData";


export default class SupabaseStorage implements IScanStorage {
    private supabaseClient: SupabaseClient;
    
    constructor() {
        this.supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
    }

    async saveProbesStartData(probes: ProbeStartData[]) {
        await this.supabaseClient.from('probes').insert(probes)
    }

    async saveScanStartData(scan: ScanStartData): Promise<{ scanId: string }> {
        await this.supabaseClient.from('scans').insert(scan)
        return { scanId: scan.id }
    }
}
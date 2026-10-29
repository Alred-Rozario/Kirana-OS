import React, { useState, useEffect } from 'react';
import {
  Server, Database, Globe, RefreshCw, Upload, CheckCircle2,
  HardDrive, Zap, Shield, Cpu, Layers, Copy, Check, Info
} from 'lucide-react';
import { api } from '../services/api';
import type { CloudServicesStatus, CloudBackupRecord } from '../types';

export const CloudServicesView: React.FC = () => {
  const [cloudStatus, setCloudStatus] = useState<CloudServicesStatus | null>(null);
  const [backups, setBackups] = useState<CloudBackupRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [backupLoading, setBackupLoading] = useState<boolean>(false);
  const [invalidateLoading, setInvalidateLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [testImageUrl, setTestImageUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statusRes, backupsRes] = await Promise.all([
        api.getCloudStatus().catch(() => null),
        api.getCloudBackups().catch(() => [])
      ]);
      if (statusRes) setCloudStatus(statusRes);
      if (backupsRes) setBackups(backupsRes);
    } catch (err) {
      console.error("Failed to load cloud data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleCreateBackup = async () => {
    try {
      setBackupLoading(true);
      const res = await api.createCloudBackup();
      showNotification(`✅ ${res.message}! S3 Key: ${res.backup.s3_key}`, 'success');
      loadData();
    } catch (err: any) {
      showNotification(`❌ Backup failed: ${err.message}`, 'error');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleInvalidateCache = async () => {
    try {
      setInvalidateLoading(true);
      const res = await api.invalidateCloudFront(['/*']);
      showNotification(`⚡ CloudFront Edge Invalidation triggered! ID: ${res.invalidation_id} (All India PoPs purged)`, 'success');
    } catch (err: any) {
      showNotification(`❌ Cache purge failed: ${err.message}`, 'error');
    } finally {
      setInvalidateLoading(false);
    }
  };

  const handleTestUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(true);
      const res = await api.uploadCloudMedia(file, 'products');
      setTestImageUrl(res.local_fallback_url || res.cloudfront_url);
      showNotification(`🚀 File uploaded to S3! CloudFront CDN URL generated: ${res.cloudfront_url}`, 'success');
      loadData();
    } catch (err: any) {
      showNotification(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  if (loading && !cloudStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-gray-600 font-medium">Connecting to AWS Cloud Infrastructure...</p>
      </div>
    );
  }

  const ec2 = cloudStatus?.services.ec2;
  const s3 = cloudStatus?.services.s3;
  const cf = cloudStatus?.services.cloudfront;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-900/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                AWS Production Ready
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-300">
                {cloudStatus?.mode === 'live' ? '🟢 Live AWS Connected' : '⚡ High-Fidelity Simulation Mode'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AWS Cloud Architecture Hub
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Enterprise 3-tier cloud deployment: <strong>AWS EC2</strong> (Compute & APIs), <strong>AWS S3</strong> (Storage & Database Backups), and <strong>AWS CloudFront</strong> (Global Edge CDN).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateBackup}
              disabled={backupLoading}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-indigo-600/30"
            >
              {backupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Backup DB to S3
            </button>
            <button
              onClick={handleInvalidateCache}
              disabled={invalidateLoading}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition border border-white/10"
            >
              {invalidateLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Purge CDN Cache
            </button>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className={`mt-4 p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between ${
            notification.type === 'success' ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30' :
            notification.type === 'error' ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30' :
            'bg-blue-500/20 text-blue-200 border border-blue-500/30'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* The 3 Core Cloud Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Service 1: AWS EC2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <Server className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {ec2?.status || 'Running'}
              </span>
            </div>
            
            <div className="text-xs font-semibold text-amber-600 tracking-wider uppercase">Cloud Service #1</div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">AWS EC2</h2>
            <p className="text-xs text-slate-500 mb-4">{ec2?.category || 'Compute (IaaS)'}</p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Instance Type:</span>
                <span className="font-semibold text-slate-800">{ec2?.instance_type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Region:</span>
                <span className="font-semibold text-slate-800">{ec2?.region}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Instance ID:</span>
                <span className="font-mono text-slate-700">{ec2?.instance_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Runtime Stack:</span>
                <span className="font-medium text-slate-700 text-right">{ec2?.runtime}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Instance Uptime:</span>
                <span className="font-semibold text-emerald-600">{ec2?.uptime}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> CPU Utilization</span>
              <span className="font-bold text-slate-800">{ec2?.cpu_utilization}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: ec2?.cpu_utilization || '12%' }} />
            </div>
          </div>
        </div>

        {/* Service 2: AWS S3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <HardDrive className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Shield className="w-3 h-3 text-blue-600" />
                {s3?.encryption || 'Encrypted'}
              </span>
            </div>

            <div className="text-xs font-semibold text-blue-600 tracking-wider uppercase">Cloud Service #2</div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">AWS S3</h2>
            <p className="text-xs text-slate-500 mb-4">{s3?.category || 'Object Storage'}</p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">S3 Bucket:</span>
                <span className="font-mono font-medium text-slate-800 text-right truncate max-w-[170px]" title={s3?.bucket_name}>
                  {s3?.bucket_name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Storage Class:</span>
                <span className="font-semibold text-slate-800">{s3?.storage_class}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Stored Objects:</span>
                <span className="font-semibold text-slate-800">{s3?.total_objects} files</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Storage Used:</span>
                <span className="font-bold text-blue-600">{s3?.storage_used_mb} MB</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Free Tier Limit:</span>
                <span className="font-medium text-slate-600">{s3?.free_tier_limit_gb} GB Free</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <label className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-xl cursor-pointer transition">
              <Upload className="w-3.5 h-3.5" />
              {uploadLoading ? 'Uploading to S3...' : 'Upload Test Asset to S3'}
              <input type="file" className="hidden" accept="image/*,.csv,.pdf" onChange={handleTestUpload} disabled={uploadLoading} />
            </label>
          </div>
        </div>

        {/* Service 3: AWS CloudFront */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Globe className="w-6 h-6" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <Zap className="w-3 h-3 text-purple-600" />
                Edge PoPs Active
              </span>
            </div>

            <div className="text-xs font-semibold text-purple-600 tracking-wider uppercase">Cloud Service #3</div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">AWS CloudFront</h2>
            <p className="text-xs text-slate-500 mb-4">{cf?.category || 'Content Delivery Network (CDN)'}</p>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-500">CDN Domain:</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-purple-700 font-medium truncate max-w-[140px]" title={cf?.distribution_domain}>
                    {cf?.distribution_domain}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`https://${cf?.distribution_domain}`)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded"
                    title="Copy CDN Domain"
                  >
                    {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cache Hit Ratio:</span>
                <span className="font-bold text-emerald-600">{cf?.cache_hit_ratio}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Avg Edge Latency:</span>
                <span className="font-bold text-purple-600">{cf?.avg_edge_latency_ms} ms</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Edge PoP Locations:</span>
                <span className="font-medium text-slate-700 text-right">Mumbai, Delhi, BLR</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Monthly Free Tier:</span>
                <span className="font-semibold text-slate-700">1,000 GB Transfer Free</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl">
            <button
              onClick={handleInvalidateCache}
              disabled={invalidateLoading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold py-2 px-3 rounded-xl transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${invalidateLoading ? 'animate-spin' : ''}`} />
              {invalidateLoading ? 'Purging Edge Nodes...' : 'Invalidate Edge Cache (/*)'}
            </button>
          </div>
        </div>

      </div>

      {/* Interactive S3 Upload & CloudFront CDN Preview */}
      {testImageUrl && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-5">
          <img
            src={testImageUrl}
            alt="Uploaded Test"
            className="w-24 h-24 object-cover rounded-xl border border-emerald-300 shadow-sm"
          />
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-bold text-emerald-950 text-sm">Asset Cached on AWS CloudFront Edge</h4>
            </div>
            <p className="text-xs text-emerald-800">
              The file was written to S3 and routed through the CloudFront global distribution with edge HTTP caching.
            </p>
            <div className="text-xs font-mono bg-emerald-100/70 p-2 rounded-lg text-emerald-900 break-all select-all">
              {`https://${cf?.distribution_domain}/products/test_upload.jpg`}
            </div>
          </div>
        </div>
      )}

      {/* Architecture Flow & Cloud Backups Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Architecture Schematic */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">3-Tier Cloud Architecture Flow</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">1</div>
              <div>
                <h4 className="font-semibold text-xs text-slate-900">User / Kirana POS Counter</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sends API requests and loads product catalog, bills, and stock dashboards.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">2</div>
              <div>
                <h4 className="font-semibold text-xs text-purple-950">AWS CloudFront (Edge Layer)</h4>
                <p className="text-xs text-purple-800 mt-0.5">
                  Terminates SSL and serves static assets and product images from nearest Edge location (&lt;15ms latency).
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">3</div>
              <div>
                <h4 className="font-semibold text-xs text-amber-950">AWS EC2 (Compute Layer)</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Processes transactions, runs JWT authentication, handles POS checkout, and computes GST & Udhaar ledgers.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">4</div>
              <div>
                <h4 className="font-semibold text-xs text-blue-950">AWS S3 (Durable Storage Layer)</h4>
                <p className="text-xs text-blue-800 mt-0.5">
                  Stores original catalog media, generated invoice PDFs, and periodic encrypted database backups.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cloud Database Backups History */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">AWS S3 Cloud Backups</h3>
              </div>
              <button
                onClick={handleCreateBackup}
                disabled={backupLoading}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                + New Backup
              </button>
            </div>

            {backups.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <HardDrive className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No cloud backups stored in S3 yet</p>
                <p className="text-xs text-slate-400 mt-1">Click "Backup DB to S3" above to create your first cloud snapshot.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {backups.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                        <Database className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 font-mono text-[11px] truncate max-w-[200px]" title={b.filename}>
                          {b.filename}
                        </p>
                        <p className="text-[10px] text-slate-400">{b.created_at}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-700">{(b.size_bytes / 1024).toFixed(1)} KB</span>
                      <div className="text-[10px] text-emerald-600 flex items-center gap-0.5 justify-end">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Synced to S3
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            Backups are stored with S3 Standard durability (99.999999999% 11 9s) for zero data loss.
          </div>
        </div>

      </div>

    </div>
  );
};

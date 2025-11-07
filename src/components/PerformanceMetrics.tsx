import { useState, useEffect } from 'react';
import { saveMetrics } from '@/lib/analytics/saveMetrics';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Activity, Clock, HardDrive, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export const PerformanceMetrics = () => {
  const [stats, setStats] = useState(saveMetrics.getStats());

  useEffect(() => {
    // Refresh stats every 30s
    const interval = setInterval(() => {
      setStats(saveMetrics.getStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    try {
      const diagnostics = saveMetrics.exportDiagnostics();
      const blob = new Blob([diagnostics], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leadya-diagnostics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Diagnostics exportés');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Performance Metrics
        </h2>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Diagnostics
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Saves</p>
              <p className="text-2xl font-bold">{stats.totalSaves}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
              <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Avg Payload</p>
              <p className="text-2xl font-bold">{formatBytes(stats.avgPayloadSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <HardDrive className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Compression</p>
              <p className="text-2xl font-bold">{((1 - stats.avgCompressionRatio) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Retries</p>
              <p className="text-2xl font-bold">{stats.totalRetries}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-2">About Metrics</h3>
        <p className="text-sm text-muted-foreground">
          Ces métriques sont collectées localement sur les 7 derniers jours pour monitorer la performance
          du système de sauvegarde. Elles incluent la compression, les diffs, et la synchronisation.
        </p>
      </Card>
    </div>
  );
};

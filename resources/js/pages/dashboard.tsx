import { Head, Link } from '@inertiajs/react';
import MachineController from '@/actions/App/Http/Controllers/MachineController';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Activity, Thermometer, Package, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<any>;
    }
}

interface Operator {
    id: number;
    name: string;
    employee_id: string;
}

interface Machine {
    id: number;
    name: string;
    type: 'CNC' | 'Milling' | 'Press' | 'Assembly';
    status: 'running' | 'idle' | 'maintenance' | 'warning';
    mqtt_topic_id: string;
    current_operator: Operator | null;
    latest_production: number;
    latest_temperature: number;
}

interface Stats {
    total_machines: number;
    running_machines: number;
    total_production: number;
    avg_temperature: number;
}

interface Props {
    machines: Machine[];
    stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

const getStatusColor = (status: Machine['status']) => {
    const colors = {
        running: 'bg-green-500',
        idle: 'bg-gray-500',
        maintenance: 'bg-yellow-500',
        warning: 'bg-red-500',
    };
    return colors[status];
};

export default function Dashboard({
    machines: initialMachines,
    stats: initialStats,
}: Props) {
    const [machines, setMachines] = useState<Machine[]>(initialMachines);
    const [stats, setStats] = useState<Stats>(initialStats);

    useEffect(() => {
        // Initialize Laravel Echo
        window.Pusher = Pusher;
        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
            wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
            forceTLS:
                (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        // Listen to production-monitoring channel
        window.Echo.channel('production-monitoring')
            .listen('.machine.data.updated', (event: any) => {
                setMachines((prev) =>
                    prev.map((m) =>
                        m.id === event.machineId
                            ? { ...m, latest_production: event.unitsProduced }
                            : m,
                    ),
                );
                // Update total production
                setStats((prev) => ({
                    ...prev,
                    total_production:
                        prev.total_production + event.unitsProduced,
                }));
            })
            .listen('.machine.status.changed', (event: any) => {
                setMachines((prev) => {
                    const updated = prev.map((m) =>
                        m.id === event.machineId
                            ? { ...m, status: event.status }
                            : m,
                    );

                    // Recalculate running machines count from updated array
                    const runningCount = updated.filter(
                        (m) => m.status === 'running',
                    ).length;

                    setStats((prevStats) => ({
                        ...prevStats,
                        running_machines: runningCount,
                    }));

                    return updated;
                });
            })
            .listen('.temperature.alert.triggered', (event: any) => {
                setMachines((prev) => {
                    const updated = prev.map((m) =>
                        m.id === event.machineId
                            ? { ...m, latest_temperature: event.temperature }
                            : m,
                    );

                    // Calculate average temperature from all machines
                    const temps = updated.filter(m => m.latest_temperature > 0);
                    const avgTemp = temps.length > 0
                        ? temps.reduce((sum, m) => sum + m.latest_temperature, 0) / temps.length
                        : 0;

                    // Update stats with new average
                    setStats((prevStats) => ({
                        ...prevStats,
                        avg_temperature: Math.round(avgTemp * 10) / 10, // Round to 1 decimal
                    }));

                    return updated;
                });
            });

        return () => {
            window.Echo.leaveChannel('production-monitoring');
        };
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-3xl font-bold">
                                Production Monitoring
                            </h2>
                            <Button asChild>
                                <a href="/reports/export" target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" />
                                    Export Report
                                </a>
                            </Button>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Real-time machine status and production data
                        </p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="mb-6 grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Machines
                                </CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_machines}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {stats.running_machines} currently running
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Running Machines
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.running_machines}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {((stats.running_machines / stats.total_machines) * 100).toFixed(1)}% utilization
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Production
                                </CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total_production}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Units produced today
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Avg Temperature
                                </CardTitle>
                                <Thermometer className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-xl font-bold">
                                    {stats.avg_temperature.toFixed(2)}°C
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Across all machines
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Machines Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Machine Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Machine</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Production</TableHead>
                                        <TableHead>Temperature</TableHead>
                                        <TableHead>Operator</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {machines.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center"
                                            >
                                                No machines found. Please add
                                                machines to start monitoring.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        machines.map((machine) => (
                                            <TableRow key={machine.id}>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={MachineController.show(machine.id).url}
                                                        className="hover:underline hover:text-primary"
                                                    >
                                                        {machine.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    {machine.type}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getStatusColor(
                                                            machine.status,
                                                        )}
                                                    >
                                                        {machine.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-mono">
                                                    {machine.latest_production}{' '}
                                                    units
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`font-mono ${machine.latest_temperature >
                                                            80
                                                            ? 'text-red-500 font-bold'
                                                            : ''
                                                            }`}
                                                    >
                                                        {
                                                            machine.latest_temperature
                                                        }
                                                        °C
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {machine.current_operator
                                                        ?.name || (
                                                            <span className="text-muted-foreground">
                                                                Unassigned
                                                            </span>
                                                        )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

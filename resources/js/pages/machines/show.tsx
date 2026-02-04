import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import MachineController from '@/actions/App/Http/Controllers/MachineController';
import type { BreadcrumbItem } from '@/types';
import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Activity, Thermometer, Package, User, ArrowLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';

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
    created_at: string;
    updated_at: string;
}

interface ProductionLog {
    id: number;
    units_produced: number;
    recorded_at: string;
    shift_type: string;
}

interface TemperatureLog {
    id: number;
    temperature: number;
    recorded_at: string;
    alert_triggered: boolean;
}

interface Props {
    machine: Machine;
    production_logs: ProductionLog[];
    temperature_logs: TemperatureLog[];
}

const getStatusColor = (status: Machine['status']) => {
    const colors = {
        running: 'bg-green-500',
        idle: 'bg-gray-500',
        maintenance: 'bg-yellow-500',
        warning: 'bg-red-500',
    };
    return colors[status];
};

export default function Show({ machine: initialMachine, production_logs: initialProdLogs, temperature_logs: initialTempLogs }: Props) {
    const [machine, setMachine] = useState<Machine>(initialMachine);
    const [productionLogs, setProductionLogs] = useState<ProductionLog[]>(initialProdLogs);
    const [temperatureLogs, setTemperatureLogs] = useState<TemperatureLog[]>(initialTempLogs);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Machines',
            href: MachineController.index().url,
        },
        {
            title: machine.name,
            href: MachineController.show(machine.id).url,
        },
    ];

    useEffect(() => {
        window.Pusher = Pusher;
        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
            wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        window.Echo.channel('production-monitoring')
            .listen('.machine.data.updated', (event: any) => {
                if (event.machineId === machine.id) {
                    const newLog: ProductionLog = {
                        id: Date.now(), // Temporary ID
                        units_produced: event.unitsProduced,
                        recorded_at: new Date().toISOString(),
                        shift_type: 'current', // Logic for shift type is backend side
                    };
                    setProductionLogs(prev => [newLog, ...prev].slice(0, 20));
                }
            })
            .listen('.machine.status.changed', (event: any) => {
                if (event.machineId === machine.id) {
                    setMachine(prev => ({
                        ...prev,
                        status: event.status
                    }));
                }
            })
            .listen('.temperature.alert.triggered', (event: any) => {
                if (event.machineId === machine.id) {
                    const newLog: TemperatureLog = {
                        id: Date.now(),
                        temperature: event.temperature,
                        recorded_at: new Date().toISOString(),
                        alert_triggered: event.temperature > 80
                    };
                    setTemperatureLogs(prev => [newLog, ...prev].slice(0, 20));
                }
            });

        return () => {
            window.Echo.leaveChannel('production-monitoring');
        };
    }, [machine.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Machine: ${machine.name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Header with Back Button */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight">{machine.name}</h2>
                            <p className="text-muted-foreground">
                                Detailed real-time monitoring and history
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href={MachineController.index().url}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Machines
                            </Link>
                        </Button>
                    </div>

                    {/* Machine Details Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Machine Status</CardTitle>
                                <Badge className={getStatusColor(machine.status)}>
                                    {machine.status}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                <Activity className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                                    <p className="text-lg font-bold">{machine.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                <User className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Operator</p>
                                    <p className="text-lg font-bold">
                                        {machine.current_operator?.name || 'Unassigned'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                                    <p className="text-lg font-bold">
                                        {new Date(machine.updated_at).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                <Activity className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">MQTT Topic</p>
                                    <p className="text-sm font-mono truncate max-w-[150px]" title={machine.mqtt_topic_id}>
                                        {machine.mqtt_topic_id}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Production History Table */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Production History (Last 20)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Units</TableHead>
                                                <TableHead>Shift</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {productionLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                        No production data recorded
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                productionLogs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell>
                                                            {format(new Date(log.recorded_at), 'HH:mm:ss')}
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {log.units_produced}
                                                        </TableCell>
                                                        <TableCell className="capitalize">
                                                            {log.shift_type}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Temperature History Table */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Thermometer className="h-5 w-5 text-muted-foreground" />
                                    <CardTitle>Temperature Logs (Last 20)</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Temperature</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {temperatureLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                        No temperature data recorded
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                temperatureLogs.map((log) => (
                                                    <TableRow key={log.id}>
                                                        <TableCell>
                                                            {format(new Date(log.recorded_at), 'HH:mm:ss')}
                                                        </TableCell>
                                                        <TableCell className={`font-mono font-medium ${log.temperature > 80 ? 'text-red-500' : ''}`}>
                                                            {log.temperature}°C
                                                        </TableCell>
                                                        <TableCell>
                                                            {log.temperature > 80 ? (
                                                                <Badge variant="destructive" className="text-xs">
                                                                    Overheat
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-200">
                                                                    Normal
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';
import MachineController from '@/actions/App/Http/Controllers/MachineController';

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
    current_operator?: Operator;
}

interface Props {
    machines: Machine[];
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

export default function Index({ machines }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this machine?')) {
            router.delete(MachineController.destroy(id).url);
        }
    };

    return (
        <AppLayout>
            <Head title="Machines" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    Machines
                                </h2>
                                <Link href="/machines/create">
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Machine
                                    </Button>
                                </Link>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>MQTT Topic</TableHead>
                                        <TableHead>Operator</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {machines.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="text-center text-gray-500"
                                            >
                                                No machines found. Add your
                                                first machine to get started.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        machines.map((machine) => (
                                            <TableRow key={machine.id}>
                                                <TableCell className="font-medium">
                                                    {machine.name}
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
                                                <TableCell className="font-mono text-sm">
                                                    {machine.mqtt_topic_id}
                                                </TableCell>
                                                <TableCell>
                                                    {machine.current_operator
                                                        ?.name || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/machines/${machine.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    machine.id,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

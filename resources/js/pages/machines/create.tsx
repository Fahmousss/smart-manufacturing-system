import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import MachineController from '@/actions/App/Http/Controllers/MachineController';

interface Operator {
    id: number;
    name: string;
    employee_id: string;
}

interface Props {
    operators: Operator[];
}

export default function Create({ operators }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        mqtt_topic_id: '',
        current_operator_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(MachineController.store().url);
    };

    return (
        <AppLayout>
            <Head title="Create Machine" />

            <div className="py-12">
                <div className="mx-auto max-w-2xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-4">
                                <Link href="/machines">
                                    <Button variant="outline" size="icon">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <h2 className="text-2xl font-semibold text-gray-800">
                                    Create New Machine
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="name">Machine Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        className="mt-1"
                                        placeholder="e.g., CNC Machine 01"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="type">Machine Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) =>
                                            setData('type', value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select machine type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CNC">
                                                CNC
                                            </SelectItem>
                                            <SelectItem value="Milling">
                                                Milling
                                            </SelectItem>
                                            <SelectItem value="Press">
                                                Press
                                            </SelectItem>
                                            <SelectItem value="Assembly">
                                                Assembly
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                <div>
                                    <Label htmlFor="mqtt_topic_id">
                                        MQTT Topic ID
                                    </Label>
                                    <Input
                                        id="mqtt_topic_id"
                                        type="text"
                                        value={data.mqtt_topic_id}
                                        onChange={(e) =>
                                            setData(
                                                'mqtt_topic_id',
                                                e.target.value,
                                            )
                                        }
                                        className="mt-1"
                                        placeholder="e.g., machine_001"
                                    />
                                    <InputError message={errors.mqtt_topic_id} />
                                </div>

                                <div>
                                    <Label htmlFor="operator">
                                        Assigned Operator (Optional)
                                    </Label>
                                    <Select
                                        value={data.current_operator_id}
                                        onValueChange={(value) =>
                                            setData('current_operator_id', value)
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select operator" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">
                                                No Operator
                                            </SelectItem>
                                            {operators.map((operator) => (
                                                <SelectItem
                                                    key={operator.id}
                                                    value={operator.id.toString()}
                                                >
                                                    {operator.name} (
                                                    {operator.employee_id})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.current_operator_id}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                    >
                                        Create Machine
                                    </Button>
                                    <Link href="/machines">
                                        <Button
                                            type="button"
                                            variant="outline"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function export(Request $request): StreamedResponse
    {
        $response = new StreamedResponse(function () {
            $handle = fopen('php://output', 'w');

            // Add BOM (Byte Order Mark) for Excel compatibility with UTF-8
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($handle, [
                'ID',
                'Machine Name',
                'Type',
                'Units Produced',
                'Shift',
                'Recorded At',
                'Operator Name'
            ]);

            // Query Data in Chunks
            DB::table('production_data')
                ->join('machines', 'production_data.machine_id', '=', 'machines.id')
                ->leftJoin('operators', 'machines.current_operator_id', '=', 'operators.id')
                ->select(
                    'production_data.id',
                    'machines.name as machine_name',
                    'machines.type',
                    'production_data.units_produced',
                    'production_data.shift_type',
                    'production_data.recorded_at',
                    'operators.name as operator_name'
                )
                ->orderBy('production_data.recorded_at', 'desc')
                ->chunk(1000, function ($rows) use ($handle) {
                    foreach ($rows as $row) {
                        fputcsv($handle, [
                            $row->id,
                            $row->machine_name,
                            $row->type,
                            $row->units_produced,
                            $row->shift_type,
                            $row->recorded_at,
                            $row->operator_name ?? 'Unassigned'
                        ]);
                    }
                });

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv');
        $response->headers->set('Content-Disposition', 'attachment; filename="production-report-' . date('Y-m-d') . '.csv"');

        return $response;
    }
}

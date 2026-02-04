<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RecordProductionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'units' => ['required', 'integer', 'min:1', 'max:1000'],
            'timestamp' => ['nullable', 'date_format:Y-m-d H:i:s'],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'units.required' => 'Production units are required',
            'units.integer' => 'Production units must be a number',
            'units.min' => 'Production units must be at least 1',
            'units.max' => 'Production units cannot exceed 1000',
            'timestamp.date_format' => 'Timestamp must be in Y-m-d H:i:s format',
        ];
    }
}

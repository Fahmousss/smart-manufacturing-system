<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class RecordTemperatureRequest extends FormRequest
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
            'temperature' => ['required', 'numeric', 'min:0', 'max:200'],
            'timestamp' => ['nullable', 'date_format:Y-m-d H:i:s'],
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'temperature.required' => 'Temperature reading is required',
            'temperature.numeric' => 'Temperature must be a number',
            'temperature.min' => 'Temperature cannot be negative',
            'temperature.max' => 'Temperature cannot exceed 200°C',
            'timestamp.date_format' => 'Timestamp must be in Y-m-d H:i:s format',
        ];
    }
}

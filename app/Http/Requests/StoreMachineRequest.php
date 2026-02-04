<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMachineRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:CNC,Milling,Press,Assembly'],
            'mqtt_topic_id' => ['required', 'string', 'unique:machines,mqtt_topic_id'],
            'current_operator_id' => ['nullable', 'exists:operators,id'],
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Machine name is required.',
            'type.required' => 'Machine type is required.',
            'type.in' => 'Machine type must be one of: CNC, Milling, Press, or Assembly.',
            'mqtt_topic_id.required' => 'MQTT Topic ID is required.',
            'mqtt_topic_id.unique' => 'This MQTT Topic ID is already in use.',
            'current_operator_id.exists' => 'The selected operator does not exist.',
        ];
    }
}

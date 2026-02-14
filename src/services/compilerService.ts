export interface CompilerInfo {
    id: string;
    name: string;
    path: string;
    version: string;
    default: boolean;
    defaultArgs: string;
}

export interface LanguageConfig {
    id: string;
    name: string;
    fileExtension: string;
    allowCustomArgs: boolean;
    defaultCode?: string;
    editorLanguage?: string;
    compilers: CompilerInfo[];
}

export interface CompilerConfigModel {
    languages: LanguageConfig[];
}

export interface CompileRequest {
    code: string;
    language: string;
    compilerId: string;
    compilerOptions?: string;
}

export interface CompileResponse {
    success: boolean;
    output?: string;
    error?: string;
}

const API_BASE_URL = 'http://localhost:8083/api/compiler';

export async function fetchCompilerConfig(): Promise<CompilerConfigModel> {
    try {
        const response = await fetch(`${API_BASE_URL}/config`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch compiler config:', error);
        throw error;
    }
}

const COMPILER_API_URL = `${API_BASE_URL}/compile`;

function formatOutput(output: string): string {
    try {
        // Try to parse as JSON first
        const parsedOutput = JSON.parse(output);

        if (parsedOutput.assemblyOutput) {
            // Return the assemblyOutput directly as it's already formatted
            return parsedOutput.assemblyOutput;
        }

        if (parsedOutput.error) {
            return parsedOutput.error;
        }
    } catch (e) {
        // If not JSON or other error, handle as plain text
        return output.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    }

    return output;
}

export async function compileCode(request: CompileRequest): Promise<CompileResponse> {
    try {
        // Log the request being sent
        console.log('Sending request:', {
            url: COMPILER_API_URL,
            body: request
        });

        const response = await fetch(COMPILER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: request.language,
                code: request.code,
                compilerId: request.compilerId,
                ...(request.compilerOptions && { compilerOptions: request.compilerOptions })
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Log the raw response
        const rawResponse = await response.text();
        console.log('Raw response:', rawResponse);

        // Try to parse the response
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(rawResponse);
            console.log('Parsed response:', jsonResponse);
        } catch (e) {
            console.error('Failed to parse response as JSON:', e);
            return {
                success: true,
                output: formatOutput(rawResponse) // Format raw response
            };
        }

        // If we got here, we have a valid JSON response
        return {
            success: jsonResponse.success ?? true,
            output: jsonResponse.assemblyOutput || jsonResponse.output || 'No output generated.',
            error: jsonResponse.error ? formatOutput(jsonResponse.error) : undefined
        };
    } catch (error) {
        console.error('Compilation error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }
}

export async function executeCode(request: CompileRequest): Promise<CompileResponse> {
    try {
        const EXECUTE_API_URL = `${API_BASE_URL}/execute`;

        console.log('Sending execute request:', {
            url: EXECUTE_API_URL,
            body: request
        });

        const response = await fetch(EXECUTE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                language: request.language,
                code: request.code,
                compilerId: request.compilerId,
                ...(request.compilerOptions && { compilerOptions: request.compilerOptions })
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawResponse = await response.text();
        console.log('Raw execute response:', rawResponse);

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(rawResponse);
            console.log('Parsed execute response:', jsonResponse);
        } catch (e) {
            console.error('Failed to parse execute response as JSON:', e);
            return {
                success: true,
                output: formatOutput(rawResponse)
            };
        }

        return {
            success: jsonResponse.success ?? true,
            output: jsonResponse.output || 'No output generated.',
            error: jsonResponse.error ? formatOutput(jsonResponse.error) : undefined
        };
    } catch (error) {
        console.error('Execution error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        };
    }
}

/* ==========================================================================
   AXIOS AND WEB REQUESTS IN TYPESCRIPT: BASIC TO PRO
   ========================================================================== */

/*
  ==========================================================================
  WHAT IS AXIOS?
  ==========================================================================
  Axios is a promise-based HTTP client for the browser and Node.js.

  WHY USE AXIOS OVER NATIVE `fetch()`?
  --------------------------------------------------------------------------
  Feature                 | Native `fetch()`              | Axios
  --------------------------------------------------------------------------
  1. JSON Conversion      | Manual: `await res.json()`    | Automatic JSON transformation
  2. HTTP Error Handling  | Doesn't reject on 404/500     | Rejects automatically on 4xx/5xx
  3. TypeScript Generics  | Not built-in for response body| Native `axios.get<T>(url)`
  4. Interceptors         | Not available natively        | Request & Response interceptors
  5. Request Timeout      | Complex (AbortSignal timeout) | Built-in: `{ timeout: 5000 }`
  6. Request Cancellation | AbortController               | Native AbortController / CancelToken
  --------------------------------------------------------------------------

  IMPORT SYNTAX NOTE:
  - In CommonJS projects (like this workspace): `import axios = require("axios");`
  - In ECMAScript Modules (ESM / Next.js / Vite): `import axios from "axios";`
*/

import axios = require("axios");
import type {
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";


// ==========================================================================
// 1. DATA MODELS & TYPES (CONTRACT FIRST)
// ==========================================================================
/*
  In TypeScript, ALWAYS define interfaces for the data you expect from APIs.
  This gives you strict compile-time checks and autocomplete for API fields.
*/

// Model for Todo item (from JSONPlaceholder)
interface TodoItem {
    userId: number;
    id: number;
    title: string;
    completed: boolean;
}

// Model for creating a new post
interface CreatePostDTO {
    title: string;
    body: string;
    userId: number;
}

// Model for response received when creating a post
interface PostResponse {
    id: number;
    title: string;
    body: string;
    userId: number;
}

// Standard API Error response structure
interface ApiErrorData {
    message: string;
    statusCode?: number;
    errorCode?: string;
}


// ==========================================================================
// 2. BASIC GET REQUEST (TYPING RESPONSE DATA)
// ==========================================================================
/*
  By providing a generic type parameter `<TodoItem>`, TypeScript guarantees that
  `response.data` is strictly typed as `TodoItem`.
*/

async function fetchSingleTodo(id: number): Promise<TodoItem | null> {
    try {
        // Syntax: axios.get<ResponseType>(url, config)
        const response: AxiosResponse<TodoItem> = await axios.get<TodoItem>(
            `https://jsonplaceholder.typicode.com/todos/${id}`
        );

        console.log(`[GET] Todo #${response.data.id}: "${response.data.title}" (Status: ${response.status})`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch todo:", error);
        return null;
    }
}


// ==========================================================================
// 3. POST REQUEST (TYPING REQUEST BODY & RESPONSE)
// ==========================================================================
/*
  In POST/PUT requests:
  - Argument 1: URL
  - Argument 2: Request payload (data)
  - Generic <PostResponse>: Type of data returned from the server
*/

async function createNewPost(newPost: CreatePostDTO): Promise<PostResponse | null> {
    try {
        const response = await axios.post<PostResponse>(
            "https://jsonplaceholder.typicode.com/posts",
            newPost
        );

        console.log(`[POST] Post created successfully with ID: ${response.data.id}`);
        return response.data;
    } catch (error) {
        console.error("Failed to create post:", error);
        return null;
    }
}


// ==========================================================================
// 4. TYPE-SAFE ERROR HANDLING (`axios.isAxiosError`)
// ==========================================================================
/*
  In TypeScript's strict mode, `catch (error)` has type `unknown`.
  Do NOT use `(error as any)`.
  Instead, use Axios's built-in type guard: `axios.isAxiosError<TErrorData>(error)`.
  This safely narrows the error to `AxiosError<TErrorData>`.
*/

async function fetchWithSafeErrorHandling(url: string): Promise<void> {
    try {
        await axios.get(url);
    } catch (error: unknown) {
        if (axios.isAxiosError<ApiErrorData>(error)) {
            // TypeScript now KNOWS this is an AxiosError!
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                console.log(`[Axios Server Error] Status: ${error.response.status}`);
                console.log(`[Axios Server Error] Data:`, error.response.data);
            } else if (error.request) {
                // The request was made, but no response was received (e.g. Network Down / Offline)
                console.log(`[Axios Network Error] No response received from server.`);
            } else {
                // Error setting up the request
                console.log(`[Axios Config Error] ${error.message}`);
            }
        } else if (error instanceof Error) {
            console.log(`[Standard Error] ${error.message}`);
        } else {
            console.log("[Unknown Error Occurred]");
        }
    }
}


// ==========================================================================
// 5. QUERY PARAMETERS WITH TYPED CONFIG
// ==========================================================================
/*
  Instead of manual string concatenation: `url?userId=1&completed=false`
  Pass a typed `params` object in the Axios request config.
*/

interface TodoQueryParams {
    userId?: number;
    completed?: boolean;
    _limit?: number;
}

async function fetchFilteredTodos(filters: TodoQueryParams): Promise<TodoItem[]> {
    try {
        const response = await axios.get<TodoItem[]>(
            "https://jsonplaceholder.typicode.com/todos",
            {
                params: filters, // Axios automatically serializes this to query string
                timeout: 5000,   // Request timeout in milliseconds (5s)
            }
        );

        console.log(`[GET Params] Retrieved ${response.data.length} todos matching filters.`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch filtered todos");
        return [];
    }
}


// ==========================================================================
// 6. PRO PATTERN: CUSTOM AXIOS INSTANCE & INTERCEPTORS
// ==========================================================================
/*
  In professional applications:
  1. Never call raw `axios.get()` everywhere.
  2. Create an `axios.create()` instance with a base URL and timeout.
  3. Use Request Interceptors to automatically inject Authorization tokens.
  4. Use Response Interceptors for centralized logging and error handling.
*/

// Create a custom instance
const apiClient = axios.create({
    baseURL: "https://jsonplaceholder.typicode.com",
    timeout: 8000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

// A. Request Interceptor: Injects auth token before sending
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const fakeAuthToken = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
        
        // Ensure headers object exists and attach token
        config.headers.Authorization = fakeAuthToken;
        console.log(`[Request Interceptor] Attached Bearer token for: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// B. Response Interceptor: Handles global response preprocessing or error redirection
apiClient.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        console.log(`[Response Interceptor] Received status ${response.status} from ${response.config.url}`);
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.log("[Response Interceptor] 401 Unauthorized - Redirecting to login...");
        }
        return Promise.reject(error);
    }
);


// ==========================================================================
// 7. PRO PATTERN: CANCELLING REQUESTS WITH AbortController
// ==========================================================================
/*
  Crucial in search inputs or SPA navigation where a previous pending request
  needs to be cancelled when a new one begins.
*/

async function fetchWithCancellationDemo(): Promise<void> {
    const controller = new AbortController();

    // Trigger an immediate cancel for demonstration purposes:
    setTimeout(() => {
        controller.abort();
        console.log("[AbortController] Request was manually cancelled!");
    }, 10);

    try {
        await axios.get("https://jsonplaceholder.typicode.com/photos", {
            signal: controller.signal, // Pass signal to cancel
        });
    } catch (error) {
        if (axios.isCancel(error)) {
            console.log("[Cancellation Caught] Request was successfully aborted.");
        } else {
            console.log("[Other Error]", error);
        }
    }
}


// ==========================================================================
// 8. PRO ARCHITECTURE: ENCAPSULATED API SERVICE CLASS
// ==========================================================================
/*
  Combines OOP, Interfaces, and Axios into a production-grade service pattern.
*/

class TodoService {
    // Reusable methods with strong types
    public static async getById(id: number): Promise<TodoItem> {
        const response = await apiClient.get<TodoItem>(`/todos/${id}`);
        return response.data;
    }

    public static async listByUser(userId: number, limit: number = 3): Promise<TodoItem[]> {
        const response = await apiClient.get<TodoItem[]>("/todos", {
            params: { userId, _limit: limit },
        });
        return response.data;
    }
}


// ==========================================================================
// 9. LIVE EXECUTION & DEMONSTRATION
// ==========================================================================

async function runAxiosDemo(): Promise<void> {
    console.log("=== STARTING AXIOS DEMONSTRATION ===");

    // 1. Basic typed GET request
    await fetchSingleTodo(1);

    // 2. Typed POST request
    await createNewPost({
        title: "Mastering TypeScript & Axios",
        body: "Step-by-step guide to enterprise-grade web requests.",
        userId: 101,
    });

    // 3. Filtered GET request with query params
    await fetchFilteredTodos({ userId: 1, completed: true, _limit: 2 });

    // 4. Safe Error handling demonstration with non-existent endpoint
    await fetchWithSafeErrorHandling("https://jsonplaceholder.typicode.com/non-existent-endpoint-404");

    // 5. Encapsulated Service Class demonstration (uses interceptor)
    const serviceTodo = await TodoService.getById(5);
    console.log(`[TodoService Result] ID: ${serviceTodo.id}, Title: "${serviceTodo.title}"`);

    // 6. Request cancellation demonstration
    await fetchWithCancellationDemo();

    console.log("=== AXIOS DEMONSTRATION COMPLETE ===");
}

// Run the demo
runAxiosDemo();

import { useState } from "react";
import Chat from "@/components/Chat";
import Question from "@/components/Question";
import Answer from "@/components/Answer";
import CodeEditor from "@/components/CodeEditor";

const ApiIntegrator = () => {
    const [code, setCode] = useState(`{
  "location": "Paris",
  "temperature": 18,
  "condition": "Partly Cloudy"
}`);

    return (
        <Chat>
            <Question>
                <div className="mb-1 text-strong-950 font-medium">
                    Use the API to get the current weather in Paris.
                </div>
                <a
                    className="text-label-sm text-[#7D52F4] transition-colors hover:text-[#8c71f6] underline"
                    href="https://api.weatherly.ai/v1/current"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    https://api.weatherly.ai/v1/current
                </a>
            </Question>
            <Answer>
                <div className="flex flex-col gap-3">
                    <div className="text-sub-600">
                        Absolutely! Here&apos;s the result for the API
                        setup, for the current weather in Paris.
                    </div>
                    <div className="bg-white-0 border border-stroke-soft-200 rounded-xl p-4 text-sub-600">
                        <p className="text-label-md font-semibold text-strong-950 mb-2">🔧 API Example</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><span className="font-medium text-strong-950">API Name:</span> Weatherly API</li>
                            <li>
                                <span className="font-medium text-strong-950">Endpoint:</span> <code className="bg-weak-50 px-1.5 py-0.5 rounded text-p-xs text-strong-950 border border-stroke-soft-200 font-mono">https://api.weatherly.ai/v1/current</code>
                            </li>
                            <li><span className="font-medium text-strong-950">Method:</span> <span className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-p-xs font-semibold border border-green-200">GET</span></li>
                            <li>
                                <span className="font-medium text-strong-950">Query Params:</span>
                                <ul className="ml-5 list-disc list-inside mt-1 space-y-0.5">
                                    <li><code className="bg-weak-50 px-1 py-0.5 rounded text-p-xs text-strong-950 font-mono">city=Paris</code></li>
                                    <li><code className="bg-weak-50 px-1 py-0.5 rounded text-p-xs text-strong-950 font-mono">unit=celsius</code></li>
                                </ul>
                            </li>
                            <li className="font-medium text-strong-950 mt-2">Response Example:</li>
                        </ul>
                    </div>
                    <CodeEditor
                        title="JSON Response"
                        language="json"
                        initialCode={code}
                        onCodeChange={setCode}
                    />
                    <div className="text-sub-600 bg-white-0 border border-stroke-soft-200 rounded-xl p-3.5">
                        It’s currently <span className="font-medium text-strong-950">18°C</span> and <span className="font-medium text-strong-950">partly cloudy</span> in Paris. A lovely
                        day to be outside!
                    </div>
                </div>
            </Answer>
        </Chat>
    );
};

export default ApiIntegrator;


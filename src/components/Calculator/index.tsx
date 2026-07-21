import Chat from "@/components/Chat";
import Question from "@/components/Question";
import Answer from "@/components/Answer";

const Calculator = () => {
    return (
        <Chat>
            <Question>
                solve this problem for me:
                <br />
                Find the derivative of f(x) = x³ + 2x² - 7
            </Question>
            <Answer>
                <div className="mb-2 text-sub-600">Sure here is the response:</div>
                <div className="bg-white-0 border border-stroke-soft-200 rounded-xl p-4 text-strong-950">
                    <p className="text-label-sm font-semibold text-strong-950 mb-2">✅ Step-by-step solution:</p>
                    <p className="text-sub-600 mb-2">We’ll differentiate f(x) term by term:</p>
                    <ol className="list-decimal list-inside space-y-1 text-sub-600 mb-4 pl-1">
                        <li>
                            Derivative of x³ is: <br />
                            <span className="font-mono text-strong-950 ml-6">→ 3x²</span>
                        </li>
                        <li>
                            Derivative of 2x² is: <br />
                            <span className="font-mono text-strong-950 ml-6">→ 2 × 2x = 4x</span>
                        </li>
                        <li>
                            Derivative of constant -7 is: <br />
                            <span className="font-mono text-strong-950 ml-6">→ 0</span>
                        </li>
                    </ol>
                    <p className="text-label-sm font-semibold text-strong-950 mb-1">🎯 Final Answer:</p>
                    <div className="inline-block bg-weak-50 border border-stroke-soft-200 rounded-lg px-3 py-1.5 font-mono text-strong-950 font-medium">
                        f&apos;(x) = 3x² + 4x
                    </div>
                </div>
            </Answer>
        </Chat>
    );
};

export default Calculator;


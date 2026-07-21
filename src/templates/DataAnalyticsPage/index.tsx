"use client";

import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Question from "@/components/Question";
import Answer from "@/components/Answer";
import Chart from "@/components/Chart";
import Button from "@/components/Button";

const DataAnalyticsPage = () => {
    return (
        <Layout>
            <Chat>
                <Question>
                    What’s the trend of Bitcoin between oct 16 and oct 22
                </Question>
                <Answer>
                    <div className="flex flex-col gap-4">
                        <div className="text-strong-950">
                            Sure here is the chart of the bitcoin
                        </div>
                        <Chart />
                        <div className="text-right">
                            <Button
                                className="rounded-lg !bg-weak-50 text-strong-950 border border-stroke-soft-200 max-md:w-full hover:bg-white-0 transition-colors"
                                icon="team"
                                isStroke
                            >
                                Send to data team
                            </Button>
                        </div>
                        <div className="text-sub-600">
                            You can change the date by choosing the filter and
                            see more charts.
                        </div>
                    </div>
                </Answer>
            </Chat>
        </Layout>
    );
};

export default DataAnalyticsPage;

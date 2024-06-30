"use server";

import React, {Suspense} from 'react';
import {lusitana} from "@/app/ui/fonts";
import {fetchCardData} from '@/app/lib/data';
import RevenueChart from "@/app/ui/dashboard/revenue-chart";
import LatestInvoices from "@/app/ui/dashboard/latest-invoices";
import CardWrapper, {Card} from "@/app/ui/dashboard/cards";
import {CardsSkeleton, LatestInvoicesSkeleton, RevenueChartSkeleton} from "@/app/ui/skeletons";

export default async function DashBoardPage() {

    //const revenue = await fetchRevenue(); // // remove fetchRevenue
    // const latestInvoices = await fetchLatestInvoices(); // wait for fetchRevenue() to finish
    // const {
    //     numberOfCustomers,
    //     numberOfInvoices,
    //     totalPaidInvoices,
    //     totalPendingInvoices
    // } = await fetchCardData(); // wait for fetchLatestInvoices() to finish

    return (
        <div>
            <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
                Dashboard
            </h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Suspense fallback={<CardsSkeleton />}>
                    <CardWrapper />
                </Suspense>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
                <Suspense fallback={<RevenueChartSkeleton />}>
                    <RevenueChart/>
                </Suspense>
                <Suspense fallback={<LatestInvoicesSkeleton/>}>
                    <LatestInvoices/>
                </Suspense>
            </div>


        </div>
    );
}


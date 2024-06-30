"use server";

import React from 'react';
import DashboardSkeleton from "@/app/ui/skeletons";

export default async function DashboardLoading() {
    return (
        <DashboardSkeleton/>
    );
}


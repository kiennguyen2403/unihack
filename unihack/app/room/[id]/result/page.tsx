"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchResult } from "@/store/slices/roomSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ResultIdeaCard from "./ResultIdeaCard";

export default function ResultPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams(); // Get params dynamically

  const { result, resultMetadata, loadingResult, roomDetails } = useSelector(
    (state: RootState) => state.room
  );

  const id = params?.id as string | undefined;

  useEffect(() => {
    if (id) {
      if (!result) {
        dispatch(fetchResult(id));
      }
    }
  }, [dispatch, id, result]);

  if (loadingResult) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!result || !resultMetadata) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No results available yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 w-full]">
      <h1 className="text-2xl font-bold">{"Goal:  " + roomDetails?.goal}</h1>
      <div className="space-y-4">
        {result.map((item, index) => (
          <ResultIdeaCard
            key={index}
            title={item.title}
            explanation={item.explanation}
          />
        ))}
      </div>
      <Card className="w-full">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Overview</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-muted-foreground text-xs">
            {resultMetadata?.additionalInfo || "No additional info available"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

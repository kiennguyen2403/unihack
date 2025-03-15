"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchResult } from "@/store/slices/roomSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ResultIdeaCard from "./ResultIdeaCard";
import LoadingOverlay from "@/components/common/LoadingOverlay";

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

  return (
    <div>
      <LoadingOverlay message="Analyzing your brainstorming session..." />

      {loadingResult && (
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader className="py-3">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="py-2">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {!result ? (
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No results available yet.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto p-6 space-y-6 w-full]">
          <h1 className="text-2xl font-bold">
            {"Goal:  " + roomDetails?.goal}
          </h1>
          <div className="space-y-4">
            {result.map((item, index) => (
              <ResultIdeaCard
                key={index}
                title={item.title}
                explanation={item.explanation}
              />
            ))}
          </div>
          {resultMetadata && (
            <Card className="w-full">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Overview</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-muted-foreground text-xs">
                  {resultMetadata.additionalInfo ||
                    "No additional info available"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

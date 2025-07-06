"use client";

import { useEffect, useState } from "react";
import { LoadingErrorPresentational } from "./presentational";

type LoadingState = "idle" | "loading" | "success" | "error";

export function LoadingErrorContainer() {
  const [renderTime, setRenderTime] = useState<number>(0);
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const startTime = performance.now();
    const endTime = performance.now();
    setRenderTime(endTime - startTime);
  }, []);

  const simulateDataLoading = async () => {
    setLoadingState("loading");
    setErrorMessage("");

    try {
      // 2秒の読み込みシミュレーション
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoadingState("success");
    } catch {
      setLoadingState("error");
      setErrorMessage("データの読み込みに失敗しました");
    }
  };

  const simulateError = () => {
    setLoadingState("error");
    setErrorMessage("意図的に発生させたエラーです。このエラーはデモ用のものです。");
  };

  const resetState = () => {
    setLoadingState("idle");
    setErrorMessage("");
  };

  const throwError = () => {
    throw new Error("このエラーはエラーバウンダリのテスト用です");
  };

  return (
    <LoadingErrorPresentational
      renderTime={renderTime}
      loadingState={loadingState}
      errorMessage={errorMessage}
      onSimulateDataLoading={simulateDataLoading}
      onSimulateError={simulateError}
      onResetState={resetState}
      onThrowError={throwError}
    />
  );
}

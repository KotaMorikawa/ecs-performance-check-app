"use client";

import { CheckCircle, ChevronDown, ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface VerificationStep {
  step: string;
  description: string;
  expected: string;
}

interface FeatureData {
  title: string;
  description: string;
  capabilities: string[];
  verificationSteps: VerificationStep[];
  technicalDetails: string[];
}

interface FeatureExplanationProps {
  feature: FeatureData;
}

export function FeatureExplanation({ feature }: FeatureExplanationProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <section>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            {feature.title}
          </CardTitle>
          <CardDescription className="text-base">{feature.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* 実現可能な機能 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                実現可能な機能
              </h3>
              <div className="flex flex-wrap gap-2">
                {feature.capabilities.map((capability) => (
                  <Badge key={capability} variant="secondary" className="text-sm">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 確認方法 */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-600" />
                確認方法
              </h3>
              <div className="space-y-4">
                {feature.verificationSteps.map((step) => (
                  <Card key={step.step} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{step.step}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-green-800">期待結果: </span>
                            <span className="text-green-700">{step.expected}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* 技術的詳細（展開・折りたたみ） */}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex items-center gap-2"
            >
              {showTechnicalDetails ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              技術的詳細を{showTechnicalDetails ? "隠す" : "表示"}
            </Button>

            {showTechnicalDetails && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base">技術的詳細</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.technicalDetails.map((detail) => (
                      <li key={detail} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

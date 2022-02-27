import React from "react";
import ConnectorWizard from "@/app/components/connectors/ConnectorWizard";
import { PipelineWizardStepProps } from "@/app/components/pipeline/PipelineWizard";
import { usePipelineWizContext } from "@/app/common/context/pipelineWizardContext";
import _ from "lodash";
import { ConnectorTypeDto } from "@/app/common/dtos/ConnectorTypeDto";
import Loading from "@/app/components/common/Loading";
import ModelType from "./ModelType";

const CUR_WIZARD_STEP_GROUP = "source";

const SourceWizard = ({
  appBaseUrl,
  curWizardStep,
  steps,
  stepGroups,
  setCurWizardStep,
}: PipelineWizardStepProps) => {

  const { pipelineWizContext, setPipelineWizContext } = usePipelineWizContext();
  if (!pipelineWizContext) return <Loading />;
  return (
    <>
      {curWizardStep !== "modelType" && (
        <ConnectorWizard
          appBaseUrl={appBaseUrl}
          category={"Model"}
          curWizardStepGroup={CUR_WIZARD_STEP_GROUP}
          curWizardStep={curWizardStep}
          steps={steps}
          stepGroups={stepGroups}
          setCurWizardStep={setCurWizardStep}
          onConnectorTypeSelect={(type: ConnectorTypeDto) => {
            _.set(pipelineWizContext, "warehouseType", type);
            setPipelineWizContext(pipelineWizContext);
          }}
          onFinish={(id) => {
            _.set(pipelineWizContext, "values.warehouseId", id);
            setPipelineWizContext(pipelineWizContext);
            setCurWizardStep(CUR_WIZARD_STEP_GROUP, "modelType");
          }}
        />
      )}

      {curWizardStep === "modelType" && (
        <ModelType
          appBaseUrl={appBaseUrl}
          curWizardStep={curWizardStep}
          steps={steps}
          stepGroups={stepGroups}
          setCurWizardStep={setCurWizardStep}
        />
      )}
    </>
  );
};

export default SourceWizard;
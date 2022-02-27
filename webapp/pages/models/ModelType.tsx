import { PipelineWizardStepProps } from "@/app/components/pipeline/PipelineWizard";
import Layout from "@/app/components/layout/Layout";
import { Form, Formik } from "formik";
import formHandler from "@/app/common/utils/formHandler";
import React, { useEffect, useState } from "react";
import warehouseService from "@/app/services/warehouseService";
import { usePipelineWizContext } from "@/app/common/context/pipelineWizardContext";
import Loading from "@/app/components/common/Loading";
import { ExecuteQueryRequestDto } from "@/app/common/dtos/ExecuteQueryRequestDto";
import bannerNotificationService from "@/app/services/bannerNotificationService";
import { ExecuteQueryResultsDto } from "@/app/common/dtos/ExecuteQueryResultsDto";
import { Table } from "react-bootstrap";
import _ from "lodash";
import InputField from "@/app/components/forminputs/InputField";
import { Button } from "react-bootstrap";
import { useSession } from "@/app/common/context/sessionContext";
import { IconChevronRight, IconLoader, IconPlayerPlay } from "@tabler/icons";
import * as yup from "yup";

const ModelType = ({
  curWizardStep,
  steps,
  stepGroups,
  setCurWizardStep,
}: PipelineWizardStepProps) => {
  const DEMO_QUERY = "SELECT * FROM USERS";
  const [demoQueries, setDemoQueries] = useState<string[] | undefined>();
  const { pipelineWizContext, setPipelineWizContext } = usePipelineWizContext();
  if (!pipelineWizContext) return <Loading />;
  const [query, setQuery] = useState<string | undefined>(
    pipelineWizContext.isDemo ? DEMO_QUERY : undefined
  );
  const [warehouseId, setWarehouseId] = useState<any>(
    pipelineWizContext.values?.warehouseId
  );
  const { isOss } = useSession();

  const nextStep = (): void => {
    if (!query) {
      bannerNotificationService.error("Please enter a query");
      return;
    }
    _.set(pipelineWizContext, "values.sourceQuery", query);
    setPipelineWizContext(pipelineWizContext);
    setCurWizardStep("destination", "selectType");
  };

  const modelTypes = [
    {
      name: "Custom SQL Query",
      icon: "/images/sql-icon.svg",
    },
  ];

  const onModelTypeSelect = (type: any) => {
    setCurWizardStep("configure", "configureModel"); //console.log("")
  };

  console.log(steps);
  console.log(stepGroups);
  console.log(curWizardStep);

  return (
    <Layout
      title={steps[curWizardStep].title}
      subTitle={steps[curWizardStep].description}
      centerTitle={true}
      steps={steps}
      stepGroups={stepGroups}
    >
      <div className="categories">
        {modelTypes?.map((type, i) => (
          <button
            key={i}
            className="btn list-group-item rounded"
            onClick={() => onModelTypeSelect(type)}
          >
            <img src={type.icon} />
            {type.name}
          </button>
        ))}
      </div>
    </Layout>
  );
};

export default ModelType;
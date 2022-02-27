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
import { PipelineSchemaResponseDto } from "@/app/common/dtos/PipelineSchemaResponseDto";
import { Table } from "react-bootstrap";
import _ from "lodash";
import InputField from "@/app/components/forminputs/InputField";
import { Button } from "react-bootstrap";
import { useSession } from "@/app/common/context/sessionContext";
import { IconChevronRight, IconLoader, IconPlayerPlay } from "@tabler/icons";
import * as yup from "yup";
import pipelineService from "@/app/services/pipelineService";
import { SelectOptionDto } from "@/app/common/dtos/SelectOptionDto";
import modelService from "@/app/services/modelService";
import Select from "react-select";

const CreateModel = ({
  curWizardStep,
  steps,
  setCurWizardStep,
  onFinish,
}: PipelineWizardStepProps) => {
  const [queryResults, setQueryResults] = useState<
    ExecuteQueryResultsDto | undefined
  >();
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
  const [pipelineSchema, setPipelineSchema] = useState<
    PipelineSchemaResponseDto | undefined
  >();
  const { isOss } = useSession();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [warehouseFields, setWarehouseFields] = useState<SelectOptionDto[]>();

  const updateDemoQueries = (whId: number) => {
    warehouseService.demoQueries(whId).then(({ data }) => {
      setDemoQueries(data);
    });
  };

  const createModel = () => {
    console.log(modelName);
    console.log(primaryKeys);
    modelService
      .create({
        // warehouseId: warehouseId,
        warehouseId: 1, //delete this after testing
        modelName: modelName,
        modelType: "SQL_QUERY_EDITOR",
        modelDetails: {
          type: "SQL_QUERY_EDITOR",
          sourceQuery: query || "",
        },
        queryModelPK: {
          primaryKeys: primaryKeys || [],
        },
      })
      .then(({ data }) => {
        console.log(data);
      });
  };

  const [primaryKeys, setValue] = useState<string[]>();
  const [modelName, setModelName] = useState("");
  const handleChange = (event: any) => {
    if (event && event[0]) {
      setValue(_.map(event, "value"));
    }
  };

  console.log("---configure---");
  console.log(steps);
  console.log(curWizardStep);
  console.log("---configure---");

  useEffect(() => {
    if (!pipelineWizContext) return;
    if (pipelineWizContext.isDemo) {
      warehouseService.get().then(({ data }) => {
        const demoWarehouseId = data.find((d) => d.demo)?.id;
        if (!demoWarehouseId) {
          setCurWizardStep("source", "selectType");
        } else {
          getDemoQuery(demoWarehouseId);
          setWarehouseId(demoWarehouseId);
          _.set(pipelineWizContext, "values.warehouseId", demoWarehouseId);
          setPipelineWizContext(pipelineWizContext);
        }
      });
    } else if (!warehouseId) {
      setCurWizardStep("source", "selectType");
    } else {
      setWarehouseId(pipelineWizContext.values?.warehouseId);
    }
  }, [
    !!pipelineWizContext,
    warehouseId,
    pipelineWizContext.values?.warehouseId,
  ]);
  const getDemoQuery = async (warehouseId: number) => {
    updateDemoQueries(warehouseId!);
  };
  const getQueryResults = (queryId: string) => {
    warehouseService
      .executeQueryResults(queryId)
      .then(({ data }) => {
        if (data.status === "PENDING") {
          setTimeout(() => getQueryResults(queryId), 1000);
        }
        console.log(data);
        console.log(query);
        if (
          data &&
          data.queryResults &&
          data.queryResults.headers &&
          data.queryResults.headers[0]
        ) {
          const fields = _.map(
            data.queryResults.headers,
            function (el: string) {
              return { label: el, value: el, title: el };
            }
          );

          console.log(fields);

          setWarehouseFields(fields);
          // _.set(pipelineWizContext, "values.sourceQuery", query);
        }
        setQueryResults(data);
      })
      .catch(() => {
        bannerNotificationService.error("Query failed unexpectedly");
      });
  };

  return (
    <Layout
      title={steps[curWizardStep].title}
      subTitle={steps[curWizardStep].description}
      centerTitle={true}
      steps={steps}
      isFluid={true}
    >
      <div className="row">
        <div className="col-6">
          <Formik
            initialValues={{
              warehouseId,
              query,
            }}
            validationSchema={yup
              .object()
              .shape({ query: yup.string().required("Enter a query") })}
            onSubmit={formHandler(
              isOss,
              {
                id: "warehouse_query_form",
                pickFieldsForEvent: ["query"],
              },
              warehouseService.executeQuery,
              (res) => {
                getQueryResults(res.queryId);
              }
            )}
            // onSubmit={() => console.log("submiting")}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <InputField
                  type="textarea"
                  minRows={3}
                  title="Query"
                  name="query"
                  onChange={setQuery}
                  placeholder="Enter Query..."
                  className="border-0 border-bottom mono-font"
                />
                {queryResults && queryResults.status === "SUCCEEDED" && (
                  <>
                    <label>Model Name</label>
                    <input
                      placeholder="Key"
                      type="text"
                      className="form-control form-control-md"
                      onChange={(e) => {
                        setModelName(e.currentTarget.value);
                      }}
                    />

                    <label>Primary Keys</label>
                    <Select
                      onChange={(event) => handleChange(event)}
                      options={warehouseFields!}
                      isMulti={true}
                      name="primaryKeys"
                    ></Select>
                  </>
                )}
                <div className="d-flex align-items-center">
                  <Button
                    type="submit"
                    className="btn mt-2"
                    disabled={isSubmitting}
                    variant="outline-primary"
                  >
                    Run Query
                    <IconPlayerPlay size={14} style={{ marginRight: "5px" }} />
                    {isSubmitting && <IconLoader className="spinner-icon" />}
                  </Button>
                  {queryResults && queryResults.status === "SUCCEEDED" && (
                    <Button
                      type="button"
                      className="btn btn-outline-primary mt-2 ms-2"
                      // onClick={() => onFinish()}
                      onClick={() => createModel()}
                    >
                      Save
                      <IconChevronRight size={16} />
                    </Button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </div>
        <div className="col-6">
          {queryResults ? (
            renderQueryResults(queryResults)
          ) : (
            <img className="w-100" src="/images/model.svg" />
          )}
        </div>
      </div>
    </Layout>
  );
};

function renderQueryResults(result: ExecuteQueryResultsDto) {
  if (result.status === "PENDING") {
    return (
      <div>
        <p>Query in progress...</p>
        <div className="table-responsive mx-auto mt-2">
          <Table hover>
            <tbody>
              <tr className="pt-4 pb-4">
                <td>
                  <div className="linear-background"></div>
                </td>
                <td>
                  <div className="linear-background"></div>
                </td>
                <td>
                  <div className="linear-background"></div>
                </td>
                <td>
                  <div className="linear-background"></div>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    );
  } else if (result.status === "FAILED") {
    return <p>Query failed with error: {result.failureMessage}</p>;
  } else if (result.queryResults) {
    return (
      <>
        <div className="table-responsive mx-auto mt-2">
          <Table hover>
            <thead>
              <tr>
                {result.queryResults.headers.map((header, i) => (
                  <th key={i}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.queryResults.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((item, j) => (
                    <td key={j}>{item}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </>
    );
  }
}

export default CreateModel;
import http from "@/app/services/http";
import { AxiosResponse } from "axios";
import { PipelineCreateRequestDto } from "@/app/common/dtos/PipelineCreateRequestDto";
import { PipelineUpdateRequestDto } from "@/app/common/dtos/PipelineUpdateRequestDto";
import { PipelineSchemaResponseDto } from "@/app/common/dtos/PipelineSchemaResponseDto";
import { PipelineSchemaResponseRestApiDto } from "@/app/common/dtos/PipelineSchemaResponseDto2";
import { EntityCreatedResponseDto } from "@/app/common/dtos/EntityCreatedResponseDto";
import { PipelineResponseDto } from "@/app/common/dtos/PipelineResponseDto";
import { OnboardCountDto } from "../common/dtos/OnboardCountDto";

export default {
  getById: (
    pipelineId: number,
    appId?: number
  ): Promise<AxiosResponse<PipelineResponseDto>> => {
    return http.get(`/v1/pipelines/${pipelineId}`, { appId });
  },
  triggerRun: (pipelineId: number): Promise<AxiosResponse<void>> => {
    return http.put(`/v1/pipelines/${pipelineId}/trigger-run`);
  },
  pause: (pipelineId: number): Promise<AxiosResponse<void>> => {
    return http.put(`/v1/pipelines/${pipelineId}/pause`);
  },
  resume: (pipelineId: number): Promise<AxiosResponse<void>> => {
    return http.put(`/v1/pipelines/${pipelineId}/resume`);
  },
  restart: (pipelineId: number): Promise<AxiosResponse<void>> => {
    return http.put(`/v1/pipelines/${pipelineId}/restart`);
  },
  delete: (pipelineId: number): Promise<AxiosResponse<void>> => {
    return http.delete(`/v1/pipelines/${pipelineId}`);
  },
  get: (appId?: number): Promise<AxiosResponse<PipelineResponseDto[]>> => {
    return http.get("/v1/pipelines", { appId });
  },

  updatePipeline: (
    pipelineId: number,
    pipelineUpdateRequest: PipelineUpdateRequestDto
  ): Promise<AxiosResponse<void>> => {
    return http.put(`/v1/pipelines/${pipelineId}`, pipelineUpdateRequest);
  },
  getSchemaForMapping: (
    req: PipelineCreateRequestDto
  ): Promise<AxiosResponse<PipelineSchemaResponseDto>> => {
    return http.post("/v1/pipelines/schemas/fetch", req);
  },
  getSchemaForRestMapping: (
    req: PipelineCreateRequestDto
  ): Promise<AxiosResponse<PipelineSchemaResponseRestApiDto>> => {
    return http.post("/v1/pipelines/schemas/fetch", req);
  },
  create: (
    req: PipelineCreateRequestDto
  ): Promise<AxiosResponse<EntityCreatedResponseDto>> => {
    return http.post("/v1/pipelines", req);
  },
  testMapping: (req: any): Promise<AxiosResponse<any>> => {
    return http.post("/v1/pipelines/mappings/test", req);
  },
  onboardCount: (): Promise<AxiosResponse<OnboardCountDto>> => {
    return http.get("/v1/pipelines/count");
  },
};

package io.castled.migrations;

import com.google.api.client.util.Lists;
import com.google.api.client.util.Sets;
import com.google.common.collect.Maps;
import com.google.inject.Singleton;
import io.castled.ObjectRegistry;
import io.castled.dtos.querymodel.ModelInputDTO;
import io.castled.dtos.querymodel.SqlQueryModelDetails;
import io.castled.models.*;
import io.castled.services.QueryModelService;
import io.castled.warehouses.WarehouseService;
import lombok.extern.slf4j.Slf4j;
import org.jdbi.v3.core.Jdbi;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Singleton
public class MappingDataMigrator extends AbstractDataMigrator {

    public MappingDataMigrator() {
        super(MigrationType.MAPPING_MIGRATION);
    }

    @Override
    public void doMigrateData() {
        MigrationsDAO pipelineDAO = ObjectRegistry.getInstance(Jdbi.class).onDemand(MigrationsDAO.class);
        WarehouseService warehouseService = ObjectRegistry.getInstance(WarehouseService.class);
        QueryModelService queryModelService = ObjectRegistry.getInstance(QueryModelService.class);
        List<Pipeline> pipelineList = pipelineDAO.fetchPipelinesWithoutModelId();

        Map<Long, Set<Long>> warehouseIdPipelineIdMap = Maps.newHashMap();
        Map<Long, Pipeline> pipelineMap = Maps.newHashMap();
        Map<Long, Map<String, Long>> warehouseIdHandledQueryMap = Maps.newHashMap();

        pipelineList.forEach(pipeline -> {
            pipelineMap.put(pipeline.getId(), pipeline);
            if (!warehouseIdPipelineIdMap.containsKey(pipeline.getWarehouseId())) {
                warehouseIdPipelineIdMap.put(pipeline.getWarehouseId(), Sets.newHashSet());
            }
            warehouseIdPipelineIdMap.get(pipeline.getWarehouseId()).add(pipeline.getId());
        });

        warehouseIdPipelineIdMap.forEach((warehouseId, pipelines) -> {
            Warehouse warehouse = warehouseService.getWarehouse(warehouseId);
            pipelines.forEach(pipelineId -> {
                Long modelId = null;

                Pipeline pipeline = pipelineMap.get(pipelineId);
                String sourceQuery = pipeline.getSourceQuery();
                if (!warehouseIdHandledQueryMap.containsKey(warehouseId)) {
                    warehouseIdHandledQueryMap.put(warehouseId, Maps.newHashMap());
                }

                if (warehouseIdHandledQueryMap.containsKey(warehouseId) && warehouseIdHandledQueryMap.get(warehouseId).containsKey(sourceQuery)
                        && warehouseIdHandledQueryMap.get(warehouseId).get(sourceQuery) != null) {
                    modelId = warehouseIdHandledQueryMap.get(warehouseId).get(sourceQuery);
                }

                if (modelId == null) {
                    List<String> oldAppPKs = pipeline.getDataMapping().getPrimaryKeys();
                    Set<String> newWarehousePKs = Sets.newHashSet();

                    if (pipeline.getDataMapping() instanceof TargetFieldsMapping) {
                        TargetFieldsMapping targetFieldsMapping = (TargetFieldsMapping) pipeline.getDataMapping();
                        targetFieldsMapping.getFieldMappings().forEach(fieldMapping -> {
                            if (oldAppPKs.contains(fieldMapping.getAppField())) {
                                newWarehousePKs.add(fieldMapping.getWarehouseField());
                            }
                        });
                    } else {
                        TargetRestApiMapping targetRestApiMapping = (TargetRestApiMapping) pipeline.getDataMapping();
                        newWarehousePKs.addAll(targetRestApiMapping.getPrimaryKeys());
                    }


                    ModelInputDTO modelInputDTO = new ModelInputDTO();
                    modelInputDTO.setWarehouseId(warehouseId);
                    modelInputDTO.setName("Model-" + pipeline.getName());
                    modelInputDTO.setType(QueryModelType.SQL);
                    modelInputDTO.setDemo(warehouse.isDemo());
                    SqlQueryModelDetails sqlQueryModelDetails = new SqlQueryModelDetails();
                    sqlQueryModelDetails.setSourceQuery(sourceQuery);
                    modelInputDTO.setDetails(sqlQueryModelDetails);
                    QueryModelPK queryModelPK = new QueryModelPK();
                    queryModelPK.setPrimaryKeys(Lists.newArrayList(newWarehousePKs));
                    modelInputDTO.setQueryPK(queryModelPK);
                    modelId = queryModelService.createQueryModel(modelInputDTO, pipeline.getTeamId());
                    warehouseIdHandledQueryMap.get(warehouseId).put(sourceQuery, modelId);
                }
                //update modelId in pipeline
                if (modelId != null) {
                    pipelineDAO.updateModelIdForPipeline(pipelineId, modelId);
                }
            });
        });
    }
}

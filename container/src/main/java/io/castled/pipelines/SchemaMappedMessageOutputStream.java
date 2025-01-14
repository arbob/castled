package io.castled.pipelines;

import io.castled.ObjectRegistry;
import io.castled.commons.models.DataSinkMessage;
import io.castled.commons.streams.DataSinkMessageOutputStream;
import io.castled.commons.streams.RecordOutputStream;
import io.castled.schema.SchemaMapper;
import io.castled.schema.models.Field;
import io.castled.schema.models.FieldSchema;
import io.castled.schema.models.RecordSchema;
import io.castled.schema.models.Tuple;
import org.apache.commons.collections.CollectionUtils;

import java.util.List;
import java.util.Map;

public class SchemaMappedMessageOutputStream implements DataSinkMessageOutputStream {

    private final RecordSchema targetSchema;
    private final RecordOutputStream recordOutputStream;
    private final Map<String, List<String>> targetSourceMapping;
    private final SchemaMapper schemaMapper;

    public SchemaMappedMessageOutputStream(RecordSchema targetSchema, RecordOutputStream recordOutputStream,
                                           Map<String, List<String>> targetSourceMapping) {
        this.targetSchema = targetSchema;
        this.recordOutputStream = recordOutputStream;
        this.targetSourceMapping = targetSourceMapping;
        this.schemaMapper = ObjectRegistry.getInstance(SchemaMapper.class);
    }

    @Override
    public void writeDataSinkMessage(DataSinkMessage dataSinkMessage) throws Exception {

        if (this.targetSourceMapping == null) {
            recordOutputStream.writeRecord(dataSinkMessage.getRecord());
            return;
        }
        Tuple.Builder targetRecordBuilder = Tuple.builder();
        for (FieldSchema field : targetSchema.getFieldSchemas()) {
            List<String> sourceFields = targetSourceMapping.get(field.getName());
            if (!CollectionUtils.isEmpty(sourceFields)) {
                for (String sourceField : sourceFields) {
                    if (sourceField != null) {
                        targetRecordBuilder.put(field, schemaMapper.transformValue(dataSinkMessage.getRecord().getValue(sourceField), field.getSchema()));
                    }
                }
            }
        }
        for (Field field : dataSinkMessage.getUnmappedSourceFields()) {
            targetRecordBuilder.put(field);
        }
        recordOutputStream.writeRecord(targetRecordBuilder.build());
    }

    @Override
    public void flush() throws Exception {
        this.recordOutputStream.flush();
    }
}

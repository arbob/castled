package io.castled.apps.connectors.restapi;

import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.inject.Singleton;
import io.castled.ObjectRegistry;
import io.castled.apps.models.DataSinkRequest;
import io.castled.apps.models.SyncObject;
import io.castled.commons.errors.errorclassifications.UnclassifiedError;
import io.castled.commons.models.MessageSyncStats;
import io.castled.commons.streams.ErrorOutputStream;
import io.castled.core.CastledOffsetListQueue;
import io.castled.schema.SchemaUtils;
import io.castled.schema.models.Field;
import io.castled.schema.models.Message;
import io.castled.schema.models.Tuple;
import io.castled.utils.TimeUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.stream.Collectors;


@Singleton
@Slf4j
public class RestApiObjectBufferedSink extends RestApiObjectSink<Message> {

    private final RestApiRestClient restApiRestClient;
    private final RestApiErrorParser restApiErrorParser;
    private final ErrorOutputStream errorOutputStream;
    private final RestApiAppConfig restApiAppConfig;
    private final AtomicLong processedRecords = new AtomicLong(0);
    private long lastProcessedOffset = 100;
    private long batchSize;

    private final AtomicLong failedRecords = new AtomicLong(0);

    private CastledOffsetListQueue<Message> requestsBuffer;

    public RestApiObjectBufferedSink(DataSinkRequest dataSinkRequest) {
        
        
        String apiURL = ((RestApiAppConfig)dataSinkRequest.getExternalApp().getConfig()).getApiURL();
        String apiKey = ((RestApiAppConfig)dataSinkRequest.getExternalApp().getConfig()).getApiKey();
        batchSize = Long.parseLong(((RestApiAppSyncConfig)dataSinkRequest.getAppSyncConfig()).getBatchSize());
        this.restApiRestClient = new RestApiRestClient(apiURL,apiKey);
        this.errorOutputStream = dataSinkRequest.getErrorOutputStream();
        this.restApiErrorParser = ObjectRegistry.getInstance(RestApiErrorParser.class);
        this.restApiAppConfig = (RestApiAppConfig) dataSinkRequest.getExternalApp().getConfig();
    }

    @Override
    protected void writeRecords(List<Message> messages) {
        List<ObjectAndError> failedRecords = this.restApiRestClient.upsertgitDetails(
                messages.stream().map(Message::getRecord).map(this::constructProperties).collect(Collectors.toList()));

        Map<Object, Message> userProfileRecordMapper = messages.stream().filter(message -> getDistinctID(message.getRecord()) != null)
                .collect(Collectors.toMap(message -> getDistinctID(message.getRecord()), Function.identity()));

        failedRecords.forEach(failedRecord ->
                failedRecord.getFailureReasons().forEach(failureReason -> this.errorOutputStream.writeFailedRecord(userProfileRecordMapper.get(failedRecord.getDistinctID()),
                        restApiErrorParser.getPipelineError(failureReason))));

        this.processedRecords.addAndGet(messages.size());
        this.lastProcessedOffset = Math.max(lastProcessedOffset, Iterables.getLast(messages).getOffset());
    }

    private Object getDistinctID(Tuple record) {
        return record.getValue(CustomeAPIObjectFields.GENERIC_OBJECT_FIELD.IDENITIFIER.getFieldName());
    }


    private Map<String, Object> constructProperties(Tuple record) {
        Map<String, Object> recordProperties = Maps.newHashMap();
        for (Field field : record.getFields()) {
            Object value = record.getValue(field.getName());
            if (value != null) {
                if (SchemaUtils.isZonedTimestamp(field.getSchema())) {
                    recordProperties.put(field.getName(), ((ZonedDateTime) value).toEpochSecond());
                } else {
                    recordProperties.put(field.getName(), value);
                }
            }
        }
        return recordProperties;
    }

    @Override
    public MessageSyncStats getSyncStats() {
        return new MessageSyncStats(processedRecords.get(), lastProcessedOffset);
    }

    @Override
    public long getMaxBufferedObjects() {
        return batchSize;
    }

    public void flushRecords() throws Exception {
        super.flushRecords();
    }
}

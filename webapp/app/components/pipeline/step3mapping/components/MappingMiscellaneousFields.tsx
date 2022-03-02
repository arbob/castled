import { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { MappingFieldsProps } from "../types/componentTypes";
import ErrorMessage from "./Layouts/ErrorMessage";
import WarehouseColumn from "./Layouts/WarehouseColumn";
import PrePopulatedFields from "./Layouts/PrePopulatedFields";
import { AdditionalFields } from "./Layouts/AdditionalFields";

export default function MappingMiscellaneousFields({
  options,
  mappingGroups,
  values,
  setFieldValue,
  setFieldTouched,
  errors,
  appType,
}: MappingFieldsProps) {
  const [additionalRow, setAdditionalRow] = useState<JSX.Element[]>([]);
  const [populatedRow, setPopulatedRow] = useState<JSX.Element[]>([]);

  useEffect(() => {
    if (prePopulatedRow)
      setPopulatedRow((prev) => [...prev, ...prePopulatedRow]);
  }, []);

  // SECTION - 4 - Miscellaneous fields filter from warehouseSchema
  const miscellaneousFieldSection = mappingGroups.filter((fields) => {
    return fields.type === "MISCELLANEOUS_FIELDS" && fields;
  });

  function addRow(e: any) {
    e.preventDefault();
    const randomKey = Math.random().toString(15).substring(2, 15);
    setAdditionalRow((prevState) => [
      ...prevState,
      additionalFields(randomKey),
    ]);
  }

  const prePopulatedRow = options.map((field) => {
    return (
      <PrePopulatedFields
        key={field.value}
        options={options}
        onChange={(e) => {
          setFieldValue?.(
            keyValueDefault("warehouseField", field.value),
            e?.value
          );
        }}
        onBlur={() =>
          setFieldTouched?.(
            keyValueDefault("warehouseField", field.value),
            true
          )
        }
        handleDelete={(e) => {
          e.preventDefault();
          deletePopulatedRow(field.value);
          setFieldValue?.(keyValueDefault("warehouseField", field.value), "");
          setFieldValue?.(keyValueDefault("appField", field.value), "");
        }}
        inputChange={(e) => {
          setFieldValue?.(
            keyValueDefault("appField", field.value),
            e.target.value
          );
        }}
        inputBlur={() =>
          setFieldTouched?.(keyValueDefault("appField", field.value), true)
        }
        inputDefaultValue={field.value}
        selectDefaultValue={{ value: field.value, label: field.label }}
      />
    );
  });

  function deletePopulatedRow(key: string) {
    // filter items based on key
    setPopulatedRow((prevState) =>
      prevState.filter((item) => {
        return item.key !== key;
      })
    );
  }

  function deleteRow(key: string) {
    // filter items based on key
    setAdditionalRow((prevState) =>
      prevState.filter((item) => {
        return item.key !== key;
      })
    );
  }

  function keyValueDefault(s: string, key?: string): string {
    return key
      ? `MISCELLANEOUS_FIELDS-${s}-${key}`
      : `MISCELLANEOUS_FIELDS-${s}-0x0x0x0x0x0x0x`;
  }

  const additionalFields = (key: string) => (
    <AdditionalFields
      key={key}
      options={options}
      onChange={(e) => {
        setFieldValue?.(keyValueDefault("warehouseField", key), e?.value);
        // addRow(true);
      }}
      onBlur={() =>
        setFieldTouched?.(keyValueDefault("warehouseField", key), true)
      }
      handleDelete={(e) => {
        e.preventDefault();
        deleteRow(key);
        setFieldValue?.(keyValueDefault("warehouseField", key), "");
        setFieldValue?.(keyValueDefault("appField", key), "");
      }}
      inputChange={(e) => {
        setFieldValue?.(keyValueDefault("appField", key), e.target.value);
      }}
      inputBlur={() =>
        setFieldTouched?.(keyValueDefault("appField", key), true)
      }
    />
  );

  return (
    <div className="row py-2">
      {miscellaneousFieldSection.length > 0 &&
        miscellaneousFieldSection?.map((field) => (
          <>
            <WarehouseColumn
              title={field.title}
              description={field.description}
            >
              {appType === "KAFKA" && populatedRow}

              <AdditionalFields
                key={"0x0x0x0x0x0x0x"}
                options={options}
                onChange={(e) => {
                  setFieldValue?.(keyValueDefault("warehouseField"), e?.value);
                  // addRow(true);
                }}
                onBlur={() =>
                  setFieldTouched?.(keyValueDefault("warehouseField"), true)
                }
                handleDelete={(e) => {
                  e.preventDefault();
                  deleteRow("0x0x0x0x0x0x0x");
                  setFieldValue?.(keyValueDefault("warehouseField"), "");
                  setFieldValue?.(keyValueDefault("appField"), "");
                }}
                inputChange={(e) => {
                  setFieldValue?.(keyValueDefault("appField"), e.target.value);
                }}
                inputBlur={() =>
                  setFieldTouched?.(keyValueDefault("appField"), true)
                }
              />
              {additionalRow}
              <Button
                onClick={addRow}
                variant="outline-primary"
                className="my-2 mx-2"
              >
                Add mapping row
              </Button>
            </WarehouseColumn>
            <ErrorMessage errors={errors} include={"miscl"} />
            <hr className="solid" />
          </>
        ))}
    </div>
  );
}
import { useState } from "react";
import Select from "react-select";
import { StringLiteralLike } from "typescript";
import { MappingFieldsProps } from "../types/componentTypes";

type MappingFieldsOptions = Pick<MappingFieldsProps, "options">;
interface RowType extends MappingFieldsOptions {
  type: string;
}

export default function MappingMiscellaneousFields({
  options,
  type
}: RowType) {
  const [warehouseSelected, setWarehouseSelected] = useState<boolean>(false);

  const renderBody = (
    <tr>
      <th>
        <Select options={options} onChange={() => setWarehouseSelected(true)} />
      </th>
      <th>
        {type === "select" ? (
          <Select
            options={options}
            onChange={() => setWarehouseSelected(true)}
          />
        ) : (
          <input
            type="text"
            placeholder="Enter a field"
            className="form-control p-2"
          />
        )}
      </th>
    </tr>
  );
  const addBody = [renderBody];

  if (warehouseSelected && type === "select") {
    addBody.push(<MappingMiscellaneousFields options={options} type={'select'}/>);
  }

  if (warehouseSelected && type !== "select") {
    addBody.push(<MappingMiscellaneousFields options={options} type={'input'}/>);
  }

  return <>{addBody}</>;
}

// import InputField from "@/app/components/forminputs/InputField";
// import InputSelect from "@/app/components/forminputs/InputSelect";
// import { values } from "lodash";
// import { useState } from "react";
// import { Placeholder } from "react-bootstrap";
// import { MappingFieldsProps } from "../types/componentTypes";

// export default function MappingTableBody({
//   title,
//   description,
//   options,
//   setFieldValue,
//   setFieldTouched,
//   fieldName,
// }: MappingFieldsProps) {
//   const [warehouseSelected, setWarehouseSelected] = useState<boolean>(false);

//   const renderBody = (
//     <tr>
//       <th>
//         <InputSelect
//           title={undefined}
//           options={options}
//           deps={undefined}
//           values={values}
//           setFieldValue={setFieldValue}
//           setFieldTouched={setFieldTouched}
//           name={fieldName + ".appField"}
//           addColumn={() => setWarehouseSelected(true)}
//         />
//       </th>
//       <th>
//         <InputField
//           className="w-100"
//           type="text"
//           title={undefined}
//           values={values}
//           setFieldValue={setFieldValue}
//           setFieldTouched={setFieldTouched}
//           name={fieldName + ".appField"}
//         />
//       </th>
//     </tr>
//   );
//   const addBody = [renderBody];

//   if (warehouseSelected) {
//     addBody.push(
//       <MappingTableBody
//         options={options}
//         title={undefined}
//         setFieldValue={setFieldValue}
//         setFieldTouched={setFieldTouched}
//         fieldName={fieldName}
//       />
//     );
//   }

//   return <>{addBody}</>;
// }

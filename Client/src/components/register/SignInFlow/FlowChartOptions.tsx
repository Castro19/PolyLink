import { useEffect } from "react";
import ReusableDropdown from "../../ui/reusable-dropdown";
import { flowchartActions, useAppDispatch, useAppSelector } from "@/redux";
import { setSelection } from "@/redux/flowchart/flowchartSlice";
import { useUserData } from "@/hooks/useUserData";

// Move configuration to a separate constant
const YEAR_OPTIONS = [
  "2015",
  "2016",
  "2017",
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
];

const FlowChartOptions = ({
  dropdownRef,
}: {
  dropdownRef?: React.RefObject<HTMLDivElement>;
}) => {
  const dispatch = useAppDispatch();
  const { catalogOptions, majorOptions, concentrationOptions, selections } =
    useAppSelector((state) => state.flowchart);
  const { handleChange } = useUserData();
  useEffect(() => {
    if (selections.catalog) {
      dispatch(flowchartActions.fetchMajorOptions(selections.catalog));
    }
  }, [selections.catalog, dispatch]);

  useEffect(() => {
    if (selections.major) {
      dispatch(
        flowchartActions.fetchConcentrationOptions({
          catalog: selections.catalog,
          major: selections.major,
        })
      );
    }
  }, [selections.major, selections.catalog, dispatch]);

  const handleChangeOption = (key: string, value: string) => {
    if (key === "startingYear") {
      handleChange({
        target: { name: "startingYear", value },
      } as React.ChangeEvent<HTMLInputElement>);
    } else if (key === "catalog") {
      handleChange({
        target: { name: "catalog", value },
      } as React.ChangeEvent<HTMLInputElement>);
    } else if (key === "major") {
      handleChange({
        target: { name: "major", value },
      } as React.ChangeEvent<HTMLInputElement>);
    } else if (key === "concentration") {
      handleChange({
        target: { name: "concentration", value },
      } as React.ChangeEvent<HTMLInputElement>);
    }

    dispatch(setSelection({ key, value }));
  };

  return (
    <div className="space-y-4">
      <ReusableDropdown
        name="Starting Year"
        dropdownItems={YEAR_OPTIONS}
        handleChangeItem={(_, value) =>
          handleChangeOption("startingYear", value)
        }
        selectedItem={selections.startingYear || ""}
        dropdownRef={dropdownRef ? dropdownRef : null}
      />
      <ReusableDropdown
        name="Catalog"
        dropdownItems={catalogOptions}
        handleChangeItem={(_, value) => handleChangeOption("catalog", value)}
        selectedItem={selections.catalog || ""}
        dropdownRef={dropdownRef ? dropdownRef : null}
      />
      <ReusableDropdown
        name="Major"
        dropdownItems={majorOptions}
        handleChangeItem={(_, value) => handleChangeOption("major", value)}
        selectedItem={selections.major || ""}
        dropdownRef={dropdownRef ? dropdownRef : null}
      />
      <ReusableDropdown
        name="Concentration"
        dropdownItems={concentrationOptions}
        handleChangeItem={(_, value) =>
          handleChangeOption("concentration", value)
        }
        selectedItem={selections.concentration || ""}
        dropdownRef={dropdownRef ? dropdownRef : null}
      />
    </div>
  );
};

export default FlowChartOptions;
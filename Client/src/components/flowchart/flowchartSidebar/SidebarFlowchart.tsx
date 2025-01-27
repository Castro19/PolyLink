import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { flowSelectionActions, useAppDispatch, useAppSelector } from "@/redux";
import FlowchartLog from "../flowchartLog/FlowchartLog";
import { setFlowchart } from "@/redux/flowchart/flowchartSlice";
import { useUserData } from "@/hooks/useUserData";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronLeft } from "lucide-react";
import CourseSearchbar from "./courses/CourseSearchbar";
import { SidebarMenuSub } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import CourseDropdown from "./courses/CourseDropdown";
import { useEffect } from "react";
import { AnimatedModalDemo } from "@/components/layout/CustomModal";
import FlowChartOptions from "@/components/register/SignInFlow/FlowChartOptions";
import { fetchFlowchartDataHelper } from "@/redux/flowchart/api-flowchart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";

export function SidebarFlowchart() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const flowchartList = useAppSelector(
    (state) => state.flowchart.flowchartList
  );
  const { selections } = useAppSelector((state) => state.flowSelection);
  const { userData } = useUserData();

  // Handler for selecting a log to view
  const handleSelectFlowchart = (flowchartId: string) => {
    dispatch(setFlowchart(flowchartId));
  };

  const handleSaveFlowchart = () => {
    if (selections.catalog && selections.major && selections.concentration) {
      fetchFlowchartDataHelper(
        dispatch,
        selections.catalog,
        selections.major,
        selections.concentration.code
      );
      navigate("/flowchart");
    } else {
      toast({
        title: "Please select a catalog and major",
        description:
          "You must select a catalog and major to create a flowchart",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (selections.catalog && selections.major) {
      dispatch(
        flowSelectionActions.fetchConcentrationOptions({
          catalog: selections.catalog,
          major: selections.major,
        })
      );
    }
  }, [selections.catalog, selections.major, dispatch]);

  useEffect(() => {
    if (selections.catalog) {
      dispatch(flowSelectionActions.fetchMajorOptions(selections.catalog));
    }
  }, [selections.catalog, dispatch]);

  return (
    <Sidebar variant="sidebar" className="flex flex-col h-full">
      <SidebarHeader className="border-b border-sidebar-border dark:border-slate-700 flex-none mt-4">
        <div className="flex items-center justify-start gap-4">
          {/* Back button */}
          <Button
            className="justify-start dark:hover:bg-transparent "
            variant="ghost"
            size="icon"
            onClick={() => {
              navigate("/profile/edit");
            }}
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-200 hover:-translate-x-1 size-10" />
          </Button>
          <span className="text-lg text-center font-semibold ml-4">
            {userData.flowchartInformation.catalog}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="border-b border-sidebar-border overflow-x-hidden">
        <ScrollArea className="h-full">
          <SidebarGroupLabel>Created Flowcharts</SidebarGroupLabel>
          <SidebarGroup>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <div className="flex items-center justify-between w-full text-lg">
                        Flowcharts
                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="max-w-60 overflow-auto transition-max-height duration-300 ease-in-out">
                    <SidebarMenuSub className="w-full gap-y-4">
                      {flowchartList?.map((flowchart) => (
                        <FlowchartLog
                          key={flowchart.flowchartId}
                          flowchart={flowchart}
                          onSelectFlowchart={handleSelectFlowchart}
                        />
                      ))}
                    </SidebarMenuSub>
                    <div className="flex items-center justify-center">
                      <div className="w-11/12 my-4">
                        <AnimatedModalDemo
                          onSave={handleSaveFlowchart}
                          title="Create Flowchart"
                          disableOutsideClick={true}
                        >
                          <FlowChartOptions type="flowchart" />
                        </AnimatedModalDemo>
                      </div>
                    </div>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
          {/* Border */}
          <div className="border-b border-sidebar-border"></div>
          {/* Classes */}
          <CourseDropdown />
          {/* Border */}
        </ScrollArea>
        <div className="border-b border-sidebar-border"></div>

        <div className="sticky bottom-0 bg-white dark:bg-gray-800">
          <CourseSearchbar />
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

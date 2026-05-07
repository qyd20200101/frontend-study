import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
]);

export interface ChartItem {
  name: string;
  value: number;
}

interface Props {
  title: string;
  data: ChartItem[];
  onBarClick?: (name: string) => void;
}

export default function AssetChart({ title, data, onBarClick }: Props) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // 初始化
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const handleClick = (params: any) => {
      onBarClick?.(params?.name);
    };
    chart.on("click", handleClick);

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    // 首次渲染
    chart.setOption({
      title: { text: title, left: "center", textStyle: { fontSize: 16 } },
      tooltip: { trigger: "axis" },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "category", data: data.map((i) => i.name) },
      yAxis: { type: "value" },
      series: [
        {
          type: "bar",
          data: data.map((i) => i.value),
          showBackground: true,
          backgroundStyle: { color: "rgba(180,180,180,0.2)" },
          itemStyle: { color: "#1890ff", borderRadius: [4, 4, 0, 0] },
        },
      ],
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.off("click", handleClick);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  // 数据变化更新
  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) return;

    if (data.length > 100) {
      console.warn("数据量过大，图表进入限流模式");
    }

    chart.setOption({
      title: { text: title },
      xAxis: { data: data.map((i) => i.name) },
      series: [{ data: data.map((i) => i.value) }],
    });
  }, [data, title]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: 300,
        padding: 15,
        borderRadius: 8,
        background: "#fff",
      }}
    />
  );
}

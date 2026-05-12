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
      title: { 
        text: title, 
        left: "center", 
        top: 10,
        textStyle: { fontSize: 18, color: "#333", fontWeight: 'normal' } 
      },
      tooltip: { 
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderWidth: 0,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        textStyle: { color: "#333" }
      },
      grid: { 
        top: 70, 
        left: 20, 
        right: 20, 
        bottom: 20, 
        // 使用新的属性或移除旧的触发警告的属性
      },
      xAxis: { 
        type: "category", 
        data: data.map((i) => i.name),
        axisLabel: { color: "#666", fontSize: 12 },
        axisLine: { lineStyle: { color: "#eee" } }
      },
      yAxis: { 
        type: "value",
        splitLine: { lineStyle: { type: "dashed", color: "#f0f0f0" } },
        axisLabel: { color: "#999" }
      },
      series: [
        {
          type: "bar",
          data: data.map((i) => i.value),
          barWidth: "40%",
          showBackground: true,
          backgroundStyle: { color: "rgba(0,0,0,0.02)" },
          itemStyle: { 
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#4facfe" },
              { offset: 1, color: "#00f2fe" }
            ])
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#2af598" },
                { offset: 1, color: "#009efd" }
              ])
            }
          }
        },
      ],
      animationDuration: 1500,
      animationEasing: "cubicOut"
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
        height: 320,
        borderRadius: 16,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
        border: "1px solid rgba(255, 255, 255, 0.18)",
        padding: "10px"
      }}
    />
  );
}

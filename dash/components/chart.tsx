import React from "react";
import Chart, { Props } from "react-apexcharts";

const options: Props["options"] = {
  chart: {
    type: "line",
    animations: {
      easing: "easeinout",
      speed: 700,
    },
    zoom: {
      enabled: false,
    },
    id: "basic-bar",
    fontFamily: "Inter, sans-serif",
    foreColor: "var(--nextui-colors-accents9)",
    stacked: true,
  },

  xaxis: {
    categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],
    labels: {
      // show: false,
      style: {
        colors: "var(--nextui-colors-accents8)",
        fontFamily: "Inter, sans-serif",
      },
    },
    axisBorder: {
      color: "var(--nextui-colors-border)",
    },
    axisTicks: {
      color: "var(--nextui-colors-border)",
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: "var(--nextui-colors-accents8)",
        fontFamily: "Inter, sans-serif",
      },
    },
  },
  tooltip: {
    enabled: false,
  },
  grid: {
    show: true,
    borderColor: "var(--nextui-colors-border)",
    strokeDashArray: 0,
    position: "back",
  },
  stroke: {
    curve: "smooth",
    fill: {
      colors: ["red"],
    },
  },
  // @ts-ignore
  markers: false,
};

interface NewChartProps {
  scoreHistory: { date: string; score: number }[];
}

export default function NewChart({ scoreHistory }: NewChartProps) {
  const reversedScoreHistory = [...scoreHistory].reverse();
  const seriesData = [{
    name: "Score History",
    data: reversedScoreHistory.map(sh => sh.score),
  }];

  const xAxisData = reversedScoreHistory.map(sh => sh.date.split('-').slice(1).join('-'));

  return (
    <div id="chart" style={{ width: '100%' }}>
      <Chart options={{ ...options, xaxis: { ...options.xaxis, categories: xAxisData } }} series={seriesData} type="area" height={425} />
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "markmap-lib";
import { Markmap, loadCSS, loadJS } from "markmap-view";
import type { INode } from "markmap-common";

const transformer = new Transformer();

interface Props {
  markdown: string;
}

export default function MarkmapView({ markdown }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const { root, features } = transformer.transform(markdown);
    const { styles, scripts } = transformer.getUsedAssets(features);

    if (styles?.length) loadCSS(styles);
    if (scripts?.length) loadJS(scripts, { getMarkmap: () => ({ Markmap }) });

    if (mmRef.current) {
      mmRef.current.setData(root as INode);
      mmRef.current.fit();
    } else {
      mmRef.current = Markmap.create(svgRef.current, {
        duration: 400,
        maxWidth: 300,
      }, root as INode);
    }
  }, [markdown]);

  return (
    <svg
      ref={svgRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

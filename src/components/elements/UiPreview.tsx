import { useMemo, type CSSProperties } from "react";
import type { ColorToken } from "@/lib/extraction-types";
import { buildThemeVars } from "@/lib/theme-tokens";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const IMAGE = "https://picsum.photos/seed/tungmd/640/360";
const AVATAR = "https://picsum.photos/seed/tungmd-avatar/96/96";

export function UiPreview({ colors }: { colors: ColorToken[] }) {
  const style = useMemo(() => buildThemeVars(colors) as CSSProperties, [colors]);

  return (
    <div
      style={style}
      className="border border-border bg-background p-8 font-grotesk text-foreground"
    >
      <div className="max-w-2xl">
        <h3 className="text-4xl font-bold leading-tight tracking-tight">
          Design that reads at a glance
        </h3>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          A short paragraph of body copy shows how text sits on the page background and how muted
          text looks next to the main foreground color.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Badge>New</Badge>
        <Badge variant="secondary">Draft</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <img src={IMAGE} alt="" loading="lazy" className="aspect-video w-full object-cover" />
          <CardHeader>
            <CardTitle>Card title</CardTitle>
            <CardDescription>Supporting text on a card surface.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={AVATAR} alt="" />
              <AvatarFallback>TM</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">Jane Doe</p>
              <p className="text-muted-foreground">Design lead</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Form controls with border and focus ring.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="you@example.com" aria-label="Email" />
            <label className="flex items-center gap-2 text-sm">
              <Checkbox defaultChecked /> Accept terms
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch defaultChecked /> Email updates
            </label>
            <Button className="w-full">Continue</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

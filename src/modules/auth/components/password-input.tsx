"use client";
import { useState, type ComponentProps } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

export function PasswordInput(props: Omit<ComponentProps<"input">, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup className="h-11">
      <InputGroupAddon>
        <LockKeyhole aria-hidden />
      </InputGroupAddon>
      <InputGroupInput {...props} type={visible ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

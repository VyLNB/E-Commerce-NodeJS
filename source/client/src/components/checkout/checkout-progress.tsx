"use client";

import {
  CheckCircle,
  MapPin,
  CreditCard,
  Truck,
  LucideProps,
} from "lucide-react";
import clsx from "clsx";
import { ForwardRefExoticComponent } from "react";

type Props = {
  currentStep: number;
};

const steps = [
  { name: "Address", icon: MapPin },
  { name: "Shipping", icon: Truck },
  { name: "Payment", icon: CreditCard },
];

interface Step {
  name: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">>;
}

function CheckoutStep({
  step,
  index,
  currentStep,
}: {
  step: Step;
  index: number;
  currentStep: number;
}) {
  const isCompleted = currentStep > index;
  const isActive = currentStep === index;

  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center gap-2 transition-colors duration-300",
        isCompleted || isActive ? "text-blue-600" : "text-gray-400"
      )}
    >
      <span
        className={clsx(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
          {
            "bg-blue-600 border-blue-600 text-white": isCompleted,
            "border-blue-600 bg-white": isActive,
            "border-gray-300 bg-white": !isCompleted && !isActive,
          }
        )}
      >
        {isCompleted ? <CheckCircle size={20} /> : <step.icon size={20} />}
      </span>
      <p className="text-sm font-medium">{step.name}</p>
    </div>
  );
}

export default function CheckoutProgress({ currentStep }: Props) {
  const progressWidth =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;

  return (
    <nav aria-label="Progress" className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute mx-11 top-5 inset-x-0 h-[1px] bg-gray-300"></div>
        <div
          className="absolute mx-11 top-5 left-0 h-[1px] bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progressWidth - 10}%` }}
        />

        <ol role="list" className="relative flex justify-between items-center">
          {steps.map((step, stepIdx) => (
            <li key={step.name}>
              <CheckoutStep
                step={step}
                index={stepIdx}
                currentStep={currentStep}
              />
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}

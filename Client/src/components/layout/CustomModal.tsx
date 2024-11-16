import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalSaveButton,
  ModalTriggerButton,
} from "@/components/ui/animated-modal";
import { ReactNode } from "react";

export function AnimatedModalDemo({
  children,
  onSave,
  title,
  excludeRefs,
  disableOutsideClick = false,
}: {
  children: ReactNode;
  onSave: () => void;
  title: string;
  excludeRefs?: React.RefObject<HTMLElement>[];
  disableOutsideClick?: boolean;
}) {
  return (
    <div className="flex items-center justify-center">
      <Modal>
        <ModalTriggerButton text={title} />
        <ModalBody
          excludeRefs={excludeRefs}
          disableOutsideClick={disableOutsideClick}
        >
          <ModalContent>{children}</ModalContent>
          <ModalFooter className="gap-4">
            <ModalSaveButton onSave={onSave} />
          </ModalFooter>
        </ModalBody>
      </Modal>
    </div>
  );
}

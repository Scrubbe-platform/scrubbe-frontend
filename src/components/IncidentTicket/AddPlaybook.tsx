import React, { useEffect, useMemo, useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/input";
import CButton from "../ui/Cbutton";
import { useFetch } from "@/hooks/useFetch";
import { endpoint } from "@/lib/api/endpoint";
import { querykeys } from "@/lib/constant";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

type AddPlaybookProps = {
  isOpen: boolean;
  onClose: () => void;
  playBook?: Playbook;
  isEdit?: boolean;
};

type Playbook = {
  id: string;
  name: string;
  description: string;
  steps?: string;
};

const EMPTY_PLAYBOOK: Playbook = {
  id: "",
  name: "",
  description: "",
  steps: "",
};

const AddPlaybook = ({
  isOpen,
  onClose,
  playBook: playBookData,
  isEdit = false,
}: AddPlaybookProps) => {
  const { post, put } = useFetch();
  const queryClient = useQueryClient();
  const [playbook, setPlaybook] = useState<Playbook>(playBookData ?? EMPTY_PLAYBOOK);

  const initialPlaybook = useMemo(
    () => playBookData ?? EMPTY_PLAYBOOK,
    [playBookData]
  );

  useEffect(() => {
    if (playBookData && isEdit) {
      setPlaybook(playBookData);
    } else {
      setPlaybook(EMPTY_PLAYBOOK);
    }
  }, [playBookData, isEdit]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!playbook.name.trim()) {
        throw new Error("Playbook name is required");
      }

      const payload = {
        name: playbook.name.trim(),
        description: playbook.description.trim() || undefined,
        steps: playbook.steps
          ?.split(/\r?\n/)
          .map((step) => step.trim())
          .filter(Boolean),
      };

      if (isEdit && playbook.id) {
        const response = await put(
          `${endpoint.playbooks.update}/${playbook.id}`,
          payload
        );
        if (!response.success) {
          throw new Error((response.data as string) ?? "Failed to update playbook");
        }
        return response.data;
      }

      const response = await post(endpoint.playbooks.create, payload);
      if (!response.success) {
        throw new Error((response.data as string) ?? "Failed to create playbook");
      }
      return response.data;
    },
    onSuccess: async () => {
      toast.success(isEdit ? "Playbook updated" : "Playbook created");
      await queryClient.invalidateQueries({
        queryKey: [querykeys.PLAYBOOKS],
      });
      setPlaybook(initialPlaybook);
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-8 dark:text-white">
          {isEdit ? "Edit Playbook" : "Add Playbook"}
        </h1>

        <Input
          label="Playbook ID"
          placeholder="Pb5"
          value={playbook?.id}
          onChange={(e) => setPlaybook({ ...playbook, id: e.target.value })}
          disabled={!isEdit}
        />
        <Input
          label="Name"
          placeholder="eg Lock Account"
          value={playbook?.name}
          onChange={(e) => setPlaybook({ ...playbook, name: e.target.value })}
        />
        <div className="space-y-2 relative">
          <p className="dark:text-white font-medium text-sm ">Description</p>
          <textarea
            placeholder="Describe the playbook"
            className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
            value={playbook?.description}
            onChange={(e) =>
              setPlaybook({ ...playbook, description: e.target.value })
            }
          />
        </div>
        <div className="space-y-2 relative">
          <p className="dark:text-white font-medium text-sm ">Steps</p>
          <textarea
            placeholder="List steps (one per line)"
            className="w-full bg-transparent text-white border border-gray-300 rounded-md p-2 text-sm "
            value={playbook?.steps}
            onChange={(e) =>
              setPlaybook({ ...playbook, steps: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end gap-4">
          <CButton
            className="w-fit border-colorScBlue border bg-transparent text-colorScBlue"
            onClick={onClose}
          >
            Close
          </CButton>
          <CButton
            className="w-fit"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
                ? "Edit Playbook"
                : "Save Playbook"}
          </CButton>
        </div>
      </div>
    </Modal>
  );
};

export default AddPlaybook;

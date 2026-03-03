"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Close,
  EditNote,
  PhoneDisabled,
  PersonOff,
  SentimentVeryDissatisfied,
  CheckRounded,
  DriveFileRenameOutline,
} from "@mui/icons-material";
import { useState } from "react";

const OPCIONES = [
  { label: "No tiene WhatsApp",          short: "Sin WA",       icon: <PhoneDisabled              sx={{ fontSize: 17 }} /> },
  { label: "No tiene género",             short: "Sin género",   icon: <PersonOff                  sx={{ fontSize: 17 }} /> },
  { label: "Respondió mal educadamente", short: "Mal educ.",    icon: <SentimentVeryDissatisfied  sx={{ fontSize: 17 }} /> },
];

const LABELS = OPCIONES.map((o) => o.label);

/** Separa el value en opciones predefinidas + texto libre */
function parseValue(val: string) {
  if (!val) return { predefined: [] as string[], custom: "" };
  const parts = val.split(" • ");
  return {
    predefined: parts.filter((p) => LABELS.includes(p)),
    custom:     parts.filter((p) => !LABELS.includes(p)).join(" • "),
  };
}

interface ObservacionesPopupProps {
  rowId: string;
  value: string;
  onChange: (rowId: string, value: string) => void;
}

export function ObservacionesPopup({ rowId, value, onChange }: ObservacionesPopupProps) {
  const [open, setOpen]           = useState(false);
  const [selected, setSelected]   = useState<string[]>([]);
  const [customText, setCustomText] = useState("");

  /* ── etiquetas abreviadas para el botón ── */
  const { predefined: curPre, custom: curCustom } = parseValue(value);
  const buttonParts: string[] = [
    ...curPre.map((p) => OPCIONES.find((o) => o.label === p)?.short ?? p),
    ...(curCustom ? [curCustom.length > 14 ? curCustom.slice(0, 14) + "…" : curCustom] : []),
  ];
  const hasValue = buttonParts.length > 0;

  const handleOpen = () => {
    const { predefined, custom } = parseValue(value);
    setSelected(predefined);
    setCustomText(custom);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = () => {
    const parts = [...selected];
    if (customText.trim()) parts.push(customText.trim());
    onChange(rowId, parts.join(" • "));
    setOpen(false);
  };

  const handleToggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((o) => o !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* ── Botón compacto en la tabla ── */}
      <Tooltip title={hasValue ? value : "Sin observación"} placement="top" arrow>
        <Box
          component="button"
          onClick={handleOpen}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            border: "1.5px solid",
            borderRadius: "20px",
            cursor: "pointer",
            px: 1.1,
            py: 0.4,
            maxWidth: 150,
            fontSize: "0.7rem",
            fontWeight: 500,
            fontFamily: "inherit",
            transition: "all 0.15s",
            overflow: "hidden",
            ...(hasValue
              ? {
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  borderColor: "#94a3b8",
                  "&:hover": { backgroundColor: "#e2e8f0", borderColor: "#64748b" },
                }
              : {
                  backgroundColor: "transparent",
                  color: "#94a3b8",
                  borderColor: "#cbd5e1",
                  borderStyle: "dashed",
                  "&:hover": { backgroundColor: "#f8fafc", color: "#64748b" },
                }),
          }}
        >
          <EditNote sx={{ fontSize: "0.95rem", flexShrink: 0 }} />
          <Box
            component="span"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {hasValue ? buttonParts.join(" · ") : "Añadir"}
          </Box>
        </Box>
      </Tooltip>

      {/* ── Popup ── */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: "16px", overflow: "hidden" } },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.8,
            px: 2.5,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.2}>
            <Box sx={{ backgroundColor: "#e2e8f0", borderRadius: "8px", p: 0.7, display: "flex", color: "#475569" }}>
              <EditNote sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} color="#334155" lineHeight={1.2}>
                Observaciones
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Selecciona una o más opciones
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: "#94a3b8" }}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Opciones */}
        <DialogContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>

          {/* Opciones predefinidas */}
          {OPCIONES.map((opcion) => {
            const isSelected = selected.includes(opcion.label);
            return (
              <Box
                key={opcion.label}
                onClick={() => handleToggle(opcion.label)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.8,
                  py: 1.2,
                  borderRadius: "10px",
                  cursor: "pointer",
                  border: "1.5px solid",
                  transition: "all 0.15s ease",
                  borderColor: isSelected ? "#334155" : "#e2e8f0",
                  backgroundColor: isSelected ? "#f1f5f9" : "#fff",
                  "&:hover": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
                }}
              >
                <Box sx={{ color: isSelected ? "#334155" : "#94a3b8", display: "flex", transition: "color 0.15s" }}>
                  {opcion.icon}
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={isSelected ? 600 : 400}
                  color={isSelected ? "#334155" : "#64748b"}
                  sx={{ flex: 1 }}
                >
                  {opcion.label}
                </Typography>
                <Box
                  sx={{
                    width: 20, height: 20, borderRadius: "50%", border: "1.5px solid", flexShrink: 0,
                    borderColor: isSelected ? "#334155" : "#cbd5e1",
                    backgroundColor: isSelected ? "#334155" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {isSelected && <CheckRounded sx={{ fontSize: 13, color: "#fff" }} />}
                </Box>
              </Box>
            );
          })}

          {/* 4ª opción: texto libre */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              px: 1.8,
              py: 1.2,
              borderRadius: "10px",
              border: "1.5px solid",
              borderColor: customText.trim() ? "#334155" : "#e2e8f0",
              backgroundColor: customText.trim() ? "#f1f5f9" : "#fff",
              transition: "all 0.15s ease",
              "&:focus-within": { borderColor: "#94a3b8", backgroundColor: "#f8fafc" },
            }}
          >
            <Box sx={{ color: customText.trim() ? "#334155" : "#94a3b8", display: "flex", pt: 0.2, transition: "color 0.15s" }}>
              <DriveFileRenameOutline sx={{ fontSize: 17 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color={customText.trim() ? "#334155" : "#94a3b8"} fontWeight={600} display="block" mb={0.3}>
                Otra observación
              </Typography>
              <InputBase
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Escribe aquí..."
                multiline
                maxRows={3}
                fullWidth
                sx={{
                  fontSize: "0.8rem",
                  color: "#475569",
                  "& input, & textarea": { p: 0 },
                }}
              />
            </Box>
            {customText.trim() && (
              <Box
                sx={{
                  width: 20, height: 20, borderRadius: "50%", flexShrink: 0, mt: 0.3,
                  backgroundColor: "#334155",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <CheckRounded sx={{ fontSize: 13, color: "#fff" }} />
              </Box>
            )}
          </Box>

        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0.5, gap: 1 }}>
          <Button
            onClick={handleClose}
            size="small"
            variant="outlined"
            sx={{ textTransform: "none", color: "#64748b", borderColor: "#e2e8f0", borderRadius: "8px" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            size="small"
            variant="contained"
            sx={{ textTransform: "none", borderRadius: "8px", backgroundColor: "#334155", "&:hover": { backgroundColor: "#1e293b" } }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

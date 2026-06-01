import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import {
  fetchCollection,
  fetchItems,
  RICHTINGEN_COLLECTION,
  RICHTINGEN_ITEMS,
  THEMAS_ITEMS,
  CAMPUSSEN_ITEMS,
} from "../webflow";
import { stripHtml } from "../utils/htmlRenderer";

function getItemId(item) {
  return (
    item._id ||
    item.id ||
    item.slug ||
    item.fieldData?.slug ||
    item.fieldData?._id ||
    item.fieldData?.id ||
    ""
  );
}

function getItemName(item) {
  return item.fieldData?.name || item.name || item.slug || "Onbekend";
}

function getFieldValue(item, names) {
  const fieldData = item.fieldData || {};
  for (const name of names) {
    if (fieldData[name] != null) return fieldData[name];
  }
  return undefined;
}

function getReferenceIds(item, names) {
  const value = getFieldValue(item, names);
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((ref) => (ref && (ref._id || ref.id || ref)) || null)
      .filter(Boolean);
  }
  if (typeof value === "object") {
    return [(value._id || value.id || value).toString()];
  }
  return [value.toString()];
}

function itemHasReference(item, names, selectedId) {
  if (!selectedId) return true;
  return getReferenceIds(item, names).some((id) => id === selectedId);
}

function buildOptionMap(collection) {
  const map = {};
  const fields = collection?.fields || [];
  fields.forEach((field) => {
    if (field.type === "Option" && field.slug) {
      const options = field.validations?.options || [];
      map[field.slug] = options.reduce((acc, option) => {
        if (option.id) acc[option.id] = option.name || option.id;
        return acc;
      }, {});
    }
  });
  return map;
}

function optionIdToLabel(optionMap, fieldSlug, id) {
  if (!id) return null;
  return optionMap[fieldSlug]?.[id] || id;
}

export default function StudiezoekerScreen() {
  const [campussen, setCampussen] = useState([]);
  const [themas, setThemas] = useState([]);
  const [richtingen, setRichtingen] = useState([]);
  const [optionMap, setOptionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedThema, setSelectedThema] = useState(null);
  const [selectedFinaliteit, setSelectedFinaliteit] = useState(null);
  const [selectedStudiejaar, setSelectedStudiejaar] = useState(null);
  const [selectedLeertype, setSelectedLeertype] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [campusRes, themaRes, richtingRes, collectionRes] =
          await Promise.all([
            fetchItems(CAMPUSSEN_ITEMS),
            fetchItems(THEMAS_ITEMS),
            fetchItems(RICHTINGEN_ITEMS),
            fetchCollection(RICHTINGEN_COLLECTION),
          ]);
        if (!mounted) return;
        setCampussen(campusRes.items || []);
        setThemas(themaRes.items || []);
        setRichtingen(richtingRes.items || []);
        setOptionMap(buildOptionMap(collectionRes));
      } catch (err) {
        console.error("Studiezoeker load failed:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const finaliteitOptions = useMemo(() => {
    const map = optionMap.finaliteit || {};
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [optionMap]);

  const studiejaarOptions = useMemo(() => {
    const map = optionMap.studiejaar || {};
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [optionMap]);

  const leertypeOptions = useMemo(() => {
    const map = optionMap.leertype || {};
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [optionMap]);

  const filteredRichtingen = useMemo(() => {
    return richtingen.filter((item) => {
      if (!itemHasReference(item, ["Campus", "campus"], selectedCampus)) {
        return false;
      }
      if (!itemHasReference(item, ["Themas", "themas"], selectedThema)) {
        return false;
      }
      const finaliteit = getFieldValue(item, ["Finaliteit", "finaliteit"]);
      if (selectedFinaliteit && finaliteit !== selectedFinaliteit) {
        return false;
      }
      const studiejaar = getFieldValue(item, ["Studiejaar", "studiejaar"]);
      if (selectedStudiejaar && studiejaar !== selectedStudiejaar) {
        return false;
      }
      const leertype = getFieldValue(item, ["Leertype", "leertype"]);
      if (selectedLeertype && leertype !== selectedLeertype) {
        return false;
      }
      return true;
    });
  }, [
    richtingen,
    selectedCampus,
    selectedThema,
    selectedFinaliteit,
    selectedStudiejaar,
    selectedLeertype,
  ]);

  const renderChip = (label, selected, onPress, color = "#f0f0f0") => (
    <TouchableOpacity
      key={label}
      style={[
        styles.chip,
        { backgroundColor: selected ? "#86BC25" : color },
        selected && styles.chipSelected,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );

  return (
    <FlatList
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Studiezoeker</Text>
          <Text style={styles.subtitle}>
            Filter op campus, thema, finaliteit, studiejaar en leertype.
          </Text>

          <Text style={styles.groupTitle}>Campus</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
          >
            {renderChip(
              "All",
              selectedCampus === null,
              () => setSelectedCampus(null),
              "#e0e0e0",
            )}
            {campussen.map((campus) => {
              const id = getItemId(campus);
              return renderChip(
                getItemName(campus),
                selectedCampus === id,
                () => setSelectedCampus(selectedCampus === id ? null : id),
              );
            })}
          </ScrollView>

          <Text style={styles.groupTitle}>Thema</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
          >
            {renderChip(
              "All",
              selectedThema === null,
              () => setSelectedThema(null),
              "#e0e0e0",
            )}
            {themas.map((thema) => {
              const id = getItemId(thema);
              return renderChip(getItemName(thema), selectedThema === id, () =>
                setSelectedThema(selectedThema === id ? null : id),
              );
            })}
          </ScrollView>

          <Text style={styles.groupTitle}>Finaliteit</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
          >
            {renderChip(
              "All",
              selectedFinaliteit === null,
              () => setSelectedFinaliteit(null),
              "#e0e0e0",
            )}
            {finaliteitOptions.map((option) =>
              renderChip(option.name, selectedFinaliteit === option.id, () =>
                setSelectedFinaliteit(
                  selectedFinaliteit === option.id ? null : option.id,
                ),
              ),
            )}
          </ScrollView>

          <Text style={styles.groupTitle}>Studiejaar</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
          >
            {renderChip(
              "All",
              selectedStudiejaar === null,
              () => setSelectedStudiejaar(null),
              "#e0e0e0",
            )}
            {studiejaarOptions.map((option) =>
              renderChip(option.name, selectedStudiejaar === option.id, () =>
                setSelectedStudiejaar(
                  selectedStudiejaar === option.id ? null : option.id,
                ),
              ),
            )}
          </ScrollView>

          <Text style={styles.groupTitle}>Leertype</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
          >
            {renderChip(
              "All",
              selectedLeertype === null,
              () => setSelectedLeertype(null),
              "#e0e0e0",
            )}
            {leertypeOptions.map((option) =>
              renderChip(option.name, selectedLeertype === option.id, () =>
                setSelectedLeertype(
                  selectedLeertype === option.id ? null : option.id,
                ),
              ),
            )}
          </ScrollView>

          <Text style={styles.resultCount}>
            {filteredRichtingen.length} richting
            {filteredRichtingen.length === 1 ? "" : "en"} gevonden
          </Text>
        </>
      }
      data={filteredRichtingen}
      keyExtractor={(item) => getItemId(item) || Math.random().toString()}
      renderItem={({ item }) => {
        const campusNames = campussen
          .filter((campus) =>
            itemHasReference(item, ["Campus", "campus"], getItemId(campus)),
          )
          .map(getItemName);
        const themaNames = themas
          .filter((thema) =>
            itemHasReference(item, ["Themas", "themas"], getItemId(thema)),
          )
          .map(getItemName);
        return (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{getItemName(item)}</Text>
            <Text style={styles.cardMeta}>
              {optionIdToLabel(
                optionMap,
                "finaliteit",
                getFieldValue(item, ["Finaliteit", "finaliteit"]),
              ) || "Geen finaliteit"}
              {" • "}
              {optionIdToLabel(
                optionMap,
                "studiejaar",
                getFieldValue(item, ["Studiejaar", "studiejaar"]),
              ) || "Geen jaar"}
              {" • "}
              {optionIdToLabel(
                optionMap,
                "leertype",
                getFieldValue(item, ["Leertype", "leertype"]),
              ) || "Geen type"}
            </Text>
            <Text style={styles.cardMeta}>
              {campusNames.join(", ") || "Geen campus"}
            </Text>
            <Text style={styles.cardMeta}>
              {themaNames.join(", ") || "Geen thema"}
            </Text>
            <Text style={styles.cardDescription} numberOfLines={3}>
              {stripHtml(
                getFieldValue(item, ["Beschrijving", "beschrijving"]) || "",
              )}
            </Text>
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Geen richtingen gevonden met deze filters.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#444", marginBottom: 16 },
  groupTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 8,
  },
  chipRow: { marginBottom: 12 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 999,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: "#86BC25",
  },
  chipText: { color: "#333" },
  chipTextSelected: { color: "#fff" },
  resultCount: { fontSize: 14, color: "#666", marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  cardMeta: { fontSize: 14, color: "#666", marginBottom: 4 },
  cardDescription: { fontSize: 15, color: "#333", lineHeight: 22 },
  empty: { color: "#666", textAlign: "center", marginTop: 20 },
});

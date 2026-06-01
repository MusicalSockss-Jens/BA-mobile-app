import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { fetchItems, NIEUWS_ITEMS, CAMPUSSEN_ITEMS } from "../webflow";
import { stripHtml } from "../utils/htmlRenderer";

function getCampusColor(campus) {
  return campus?.fieldData?.kleur || "#cccccc";
}

function itemHasCampus(item, campusId) {
  if (!item || !item.fieldData) return false;
  const f = item.fieldData.Campussen || item.fieldData.campussen;
  if (!f) return false;
  if (Array.isArray(f)) {
    return f.some(
      (ref) =>
        (ref && (ref._id || ref.id || ref)) === campusId || ref === campusId,
    );
  }
  if (typeof f === "string") return f === campusId;
  if (typeof f === "object" && (f._id || f.id))
    return (f._id || f.id) === campusId;
  return false;
}

export default function HomeScreen({ navigation }) {
  const [campuses, setCampuses] = useState([]);
  const [nieuws, setNieuws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const [cRes, nRes] = await Promise.all([
          fetchItems(CAMPUSSEN_ITEMS),
          fetchItems(NIEUWS_ITEMS),
        ]);
        if (!mounted) return;
        setCampuses(cRes.items || []);
        setNieuws(nRes.items || []);
      } catch (err) {
        console.error("Failed to load data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredNieuws = selectedCampus
    ? nieuws.filter((i) => itemHasCampus(i, selectedCampus))
    : nieuws;

  const selectedCampusObj = campuses.find(
    (c) => (c._id || c.id || c.fieldData?.slug || c.slug) === selectedCampus,
  );

  const campusLocation =
    selectedCampusObj?.fieldData?.locatie ||
    selectedCampusObj?.fieldData?.Locatie ||
    "";
  const campusExpertise =
    selectedCampusObj?.fieldData?.expertise ||
    selectedCampusObj?.fieldData?.Expertise ||
    "";

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  const renderHeader = () => (
    <>
      <Text style={styles.heading}>Campussen</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.campusRow}
      >
        <TouchableOpacity
          onPress={() => setSelectedCampus(null)}
          style={[
            styles.campus,
            selectedCampus === null && styles.campusSelected,
          ]}
        >
          <Text style={styles.campusText}>All</Text>
        </TouchableOpacity>
        {campuses.map((c) => {
          const color = getCampusColor(c);
          const id = c._id || c.id || c.fieldData?.slug || c.slug;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => setSelectedCampus(id)}
              style={[
                styles.campus,
                { backgroundColor: color },
                selectedCampus === id && styles.campusSelected,
              ]}
            >
              <Text style={styles.campusText}>
                {c.fieldData?.name || c.name || id}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedCampusObj ? (
        <View style={styles.campusDetails}>
          <Text style={styles.campusDetailsTitle}>
            {selectedCampusObj.fieldData?.name || "Campus details"}
          </Text>
          {campusLocation ? (
            <Text style={styles.campusDetailsText}>
              Adres: {campusLocation}
            </Text>
          ) : null}
          {campusExpertise ? (
            <Text style={styles.campusDetailsText}>
              Expertise: {campusExpertise}
            </Text>
          ) : null}
        </View>
      ) : null}

      <TouchableOpacity
        style={styles.studiezoekerButton}
        onPress={() => navigation.navigate("Studiezoeker")}
      >
        <Text style={styles.studiezoekerText}>Open Studiezoeker</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.miniGameButton}
        onPress={() => navigation.navigate("MiniGame")}
      >
        <Text style={styles.miniGameText}>Speel mini-game</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Nieuwsberichten</Text>
    </>
  );

  return (
    <FlatList
      contentContainerStyle={styles.container}
      ListHeaderComponent={renderHeader}
      data={filteredNieuws}
      keyExtractor={(item) =>
        item._id || item.id || item.slug || Math.random().toString()
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("NewsDetail", { item })}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>
            {item.fieldData?.name ||
              item.name ||
              item.fieldData?.slug ||
              "Untitled"}
          </Text>
          <Text style={styles.cardExcerpt} numberOfLines={3}>
            {stripHtml(
              item.fieldData?.["post-body"] || item.fieldData?.post_body || "",
            )}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>No nieuwsberichten found.</Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 20, fontWeight: "bold", marginVertical: 12 },
  campusRow: { marginBottom: 12 },
  campus: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  campusSelected: { borderWidth: 2, borderColor: "#000" },
  campusText: { color: "#fff", fontWeight: "600" },
  empty: { color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "bold" },
  cardExcerpt: { color: "#444", marginTop: 6 },
  campusDetails: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  campusDetailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  campusDetailsText: {
    color: "#444",
    marginBottom: 4,
  },
  studiezoekerButton: {
    backgroundColor: "#86BC25",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  studiezoekerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  miniGameButton: {
    backgroundColor: "#86BC25",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
  },
  miniGameText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});

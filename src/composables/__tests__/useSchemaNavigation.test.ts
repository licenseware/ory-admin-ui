import { describe, it, expect, beforeEach } from "vitest"
import { ref, type Ref } from "vue"
import { useSchemaNavigation } from "../useSchemaNavigation"

const testSchema: Record<string, unknown> = {
  properties: {
    traits: {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        name: {
          type: "object",
          properties: {
            first: { type: "string" },
            last: { type: "string" },
          },
          required: ["first"],
        },
        tags: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              value: { type: "number" },
            },
            required: ["label"],
          },
        },
        role: { type: ["string", "null"] },
      },
      required: ["email"],
    },
  },
}

describe("useSchemaNavigation", () => {
  let schema: Ref<Record<string, unknown> | null>
  let nav: ReturnType<typeof useSchemaNavigation>

  beforeEach(() => {
    schema = ref(structuredClone(testSchema)) as Ref<Record<string, unknown> | null>
    nav = useSchemaNavigation(schema as Ref<any>)
  })

  describe("tree", () => {
    it("builds tree from schema traits", () => {
      expect(nav.tree.value).toHaveLength(4)
      expect(nav.tree.value.map((n) => n.name)).toEqual(["email", "name", "tags", "role"])
    })

    it("marks required fields", () => {
      const email = nav.tree.value.find((n) => n.name === "email")!
      const name = nav.tree.value.find((n) => n.name === "name")!
      expect(email.required).toBe(true)
      expect(name.required).toBe(false)
    })

    it("builds nested children for object types", () => {
      const name = nav.tree.value.find((n) => n.name === "name")!
      expect(name.children).toHaveLength(2)
      expect(name.children.map((c) => c.name)).toEqual(["first", "last"])
    })

    it("marks nested required fields", () => {
      const name = nav.tree.value.find((n) => n.name === "name")!
      const first = name.children.find((c) => c.name === "first")!
      const last = name.children.find((c) => c.name === "last")!
      expect(first.required).toBe(true)
      expect(last.required).toBe(false)
    })

    it("builds [items] children for array types", () => {
      const tags = nav.tree.value.find((n) => n.name === "tags")!
      const items = tags.children.find((c) => c.name === "[items]")!
      expect(items).toBeDefined()
      expect(items.children).toHaveLength(2)
      expect(items.children.map((c) => c.name)).toEqual(["label", "value"])
    })

    it("returns empty tree when schema is null", () => {
      schema.value = null
      expect(nav.tree.value).toEqual([])
    })
  })

  describe("allPaths", () => {
    it("lists top-level trait paths", () => {
      expect(nav.allPaths.value).toEqual(["email", "name", "tags", "role"])
    })

    it("includes nested paths when node is expanded", () => {
      nav.toggleExpand("name")
      expect(nav.allPaths.value).toContain("name.first")
      expect(nav.allPaths.value).toContain("name.last")
    })

    it("includes items paths when array node is expanded", () => {
      nav.toggleExpand("tags")
      expect(nav.allPaths.value).toContain("tags.[items]")
    })

    it("includes item children when items node is expanded", () => {
      nav.toggleExpand("tags")
      nav.toggleExpand("tags.[items]")
      expect(nav.allPaths.value).toContain("tags.[items].label")
      expect(nav.allPaths.value).toContain("tags.[items].value")
    })

    it("returns empty when schema is null", () => {
      schema.value = null
      expect(nav.allPaths.value).toEqual([])
    })
  })

  describe("moveDown", () => {
    it("selects first path when nothing focused", () => {
      nav.moveDown()
      expect(nav.focusedPath.value).toBe("email")
    })

    it("advances to next path", () => {
      nav.focusedPath.value = "email"
      nav.moveDown()
      expect(nav.focusedPath.value).toBe("name")
    })

    it("stays at last path", () => {
      nav.focusedPath.value = "role"
      nav.moveDown()
      expect(nav.focusedPath.value).toBe("role")
    })

    it("does nothing when paths are empty", () => {
      schema.value = null
      nav.moveDown()
      expect(nav.focusedPath.value).toBe("")
    })
  })

  describe("moveUp", () => {
    it("selects first path when nothing focused", () => {
      nav.moveUp()
      expect(nav.focusedPath.value).toBe("email")
    })

    it("goes to previous path", () => {
      nav.focusedPath.value = "name"
      nav.moveUp()
      expect(nav.focusedPath.value).toBe("email")
    })

    it("stays at first path", () => {
      nav.focusedPath.value = "email"
      nav.moveUp()
      expect(nav.focusedPath.value).toBe("email")
    })

    it("does nothing when paths are empty", () => {
      schema.value = null
      nav.moveUp()
      expect(nav.focusedPath.value).toBe("")
    })
  })

  describe("toggleExpand", () => {
    it("expands a collapsed path", () => {
      nav.toggleExpand("name")
      expect(nav.expandedPaths.value.has("name")).toBe(true)
    })

    it("collapses an expanded path", () => {
      nav.toggleExpand("name")
      nav.toggleExpand("name")
      expect(nav.expandedPaths.value.has("name")).toBe(false)
    })

    it("uses focusedPath when no argument", () => {
      nav.focusedPath.value = "name"
      nav.toggleExpand()
      expect(nav.expandedPaths.value.has("name")).toBe(true)
    })

    it("does nothing when no path and no focus", () => {
      const sizeBefore = nav.expandedPaths.value.size
      nav.toggleExpand()
      expect(nav.expandedPaths.value.size).toBe(sizeBefore)
    })
  })

  describe("select", () => {
    it("selects a given path", () => {
      nav.select("email")
      expect(nav.selectedPath.value).toBe("email")
    })

    it("uses focusedPath when no argument", () => {
      nav.focusedPath.value = "name"
      nav.select()
      expect(nav.selectedPath.value).toBe("name")
    })

    it("does nothing when no path and no focus", () => {
      nav.select()
      expect(nav.selectedPath.value).toBe("")
    })
  })

  describe("expandAll / collapseAll", () => {
    it("expands all nodes with children", () => {
      nav.expandAll()
      expect(nav.expandedPaths.value.has("name")).toBe(true)
      expect(nav.expandedPaths.value.has("tags")).toBe(true)
    })

    it("collapseAll clears all expanded paths", () => {
      nav.expandAll()
      nav.collapseAll()
      expect(nav.expandedPaths.value.size).toBe(0)
    })
  })

  describe("toggleFullscreen", () => {
    it("toggles fullscreen on and off", () => {
      expect(nav.isFullscreen.value).toBe(false)
      nav.toggleFullscreen()
      expect(nav.isFullscreen.value).toBe(true)
      nav.toggleFullscreen()
      expect(nav.isFullscreen.value).toBe(false)
    })
  })

  describe("handleKeydown", () => {
    function keydown(key: string) {
      const event = new KeyboardEvent("keydown", { key, cancelable: true })
      nav.handleKeydown(event)
      return event
    }

    it("ArrowDown moves focus down", () => {
      keydown("ArrowDown")
      expect(nav.focusedPath.value).toBe("email")
    })

    it("j moves focus down", () => {
      keydown("j")
      expect(nav.focusedPath.value).toBe("email")
    })

    it("ArrowUp moves focus up", () => {
      nav.focusedPath.value = "name"
      keydown("ArrowUp")
      expect(nav.focusedPath.value).toBe("email")
    })

    it("k moves focus up", () => {
      nav.focusedPath.value = "name"
      keydown("k")
      expect(nav.focusedPath.value).toBe("email")
    })

    it("ArrowRight expands collapsed focused node", () => {
      nav.focusedPath.value = "name"
      keydown("ArrowRight")
      expect(nav.expandedPaths.value.has("name")).toBe(true)
    })

    it("ArrowRight does nothing on already-expanded node", () => {
      nav.focusedPath.value = "name"
      nav.toggleExpand("name")
      keydown("ArrowRight")
      expect(nav.expandedPaths.value.has("name")).toBe(true)
    })

    it("ArrowLeft collapses expanded focused node", () => {
      nav.focusedPath.value = "name"
      nav.toggleExpand("name")
      keydown("ArrowLeft")
      expect(nav.expandedPaths.value.has("name")).toBe(false)
    })

    it("ArrowLeft does nothing on collapsed node", () => {
      nav.focusedPath.value = "name"
      keydown("ArrowLeft")
      expect(nav.expandedPaths.value.has("name")).toBe(false)
    })

    it("Enter selects focused path", () => {
      nav.focusedPath.value = "email"
      keydown("Enter")
      expect(nav.selectedPath.value).toBe("email")
    })

    it("/ calls preventDefault", () => {
      const event = keydown("/")
      expect(event.defaultPrevented).toBe(true)
    })

    it("Escape exits fullscreen first", () => {
      nav.isFullscreen.value = true
      nav.searchQuery.value = "test"
      keydown("Escape")
      expect(nav.isFullscreen.value).toBe(false)
      expect(nav.searchQuery.value).toBe("test")
    })

    it("Escape clears search when not fullscreen", () => {
      nav.searchQuery.value = "test"
      keydown("Escape")
      expect(nav.searchQuery.value).toBe("")
    })
  })

  describe("getSchemaAtPath", () => {
    it("returns schema for top-level path", () => {
      const result = nav.getSchemaAtPath("email")
      expect(result).toEqual({ type: "string", format: "email" })
    })

    it("returns schema for nested path", () => {
      expect(nav.getSchemaAtPath("name.first")).toEqual({ type: "string" })
    })

    it("returns schema for [items] path", () => {
      const result = nav.getSchemaAtPath("tags.[items]")
      expect(result?.properties).toBeDefined()
      expect(result?.required).toContain("label")
    })

    it("returns null for non-existent path", () => {
      expect(nav.getSchemaAtPath("nonexistent")).toBeNull()
    })

    it("returns null when schema is null", () => {
      schema.value = null
      expect(nav.getSchemaAtPath("email")).toBeNull()
    })

    it("returns null for invalid nested path", () => {
      expect(nav.getSchemaAtPath("email.nonexistent")).toBeNull()
    })
  })

  describe("isPathRequired", () => {
    it("returns true for required top-level field", () => {
      expect(nav.isPathRequired("email")).toBe(true)
    })

    it("returns false for optional top-level field", () => {
      expect(nav.isPathRequired("name")).toBe(false)
    })

    it("returns true for required nested field", () => {
      expect(nav.isPathRequired("name.first")).toBe(true)
    })

    it("returns false for optional nested field", () => {
      expect(nav.isPathRequired("name.last")).toBe(false)
    })

    it("returns false when schema is null", () => {
      schema.value = null
      expect(nav.isPathRequired("email")).toBe(false)
    })
  })

  describe("filteredTree", () => {
    it("returns full tree when search is empty", () => {
      nav.searchQuery.value = ""
      expect(nav.filteredTree.value).toEqual(nav.tree.value)
    })

    it("filters by property name", () => {
      nav.searchQuery.value = "email"
      const names = nav.filteredTree.value.map((n) => n.name)
      expect(names).toContain("email")
      expect(names).not.toContain("role")
    })

    it("filters by type", () => {
      nav.searchQuery.value = "number"
      // "number" matches tags > [items] > value, so "tags" should appear as parent
      expect(nav.filteredTree.value.some((n) => n.name === "tags")).toBe(true)
    })

    it("includes parent when child matches", () => {
      nav.searchQuery.value = "first"
      expect(nav.filteredTree.value.some((n) => n.name === "name")).toBe(true)
    })

    it("filters by format", () => {
      nav.searchQuery.value = "email"
      expect(nav.filteredTree.value.some((n) => n.name === "email")).toBe(true)
    })

    it("handles array type for getType", () => {
      // role has type: ["string", "null"], getType should return "string"
      nav.searchQuery.value = "string"
      expect(nav.filteredTree.value.some((n) => n.name === "role")).toBe(true)
    })
  })
})

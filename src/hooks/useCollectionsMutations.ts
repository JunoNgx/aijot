import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DateTime } from "luxon"
import { toast } from "sonner"
import { storage } from "@/db"
import { queryKeys } from "@/db/queryKeys"
import type { Collection } from "@/types"

export function useCollectionsMutations() {
    const queryClient = useQueryClient()

    const invalidateCollectionQueries = () => {
        queryClient.invalidateQueries({
            queryKey: queryKeys.collections,
            exact: false,
        })
    }

    const createCollectionMutation = useMutation({
        mutationFn: async (collection: Collection) => {
            await storage.putCollection(collection)
        },
        onMutate: async (collection) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.collections })
            const previousCollections = queryClient.getQueryData<Collection[]>(
                queryKeys.collections,
            )
            queryClient.setQueryData<Collection[]>(
                queryKeys.collections,
                (prev) => [...(prev ?? []), collection],
            )
            return { previousCollections }
        },
        onError: (_err, _collection, context) => {
            queryClient.setQueryData(
                queryKeys.collections,
                context?.previousCollections,
            )
        },
        onSettled: () => {
            invalidateCollectionQueries()
        },
    })

    const updateCollectionMutation = useMutation({
        mutationFn: async (updatedCollection: Collection) => {
            await storage.putCollection(updatedCollection)
        },
        onMutate: async (updatedCollection) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.collections })
            const previousCollections = queryClient.getQueryData<Collection[]>(
                queryKeys.collections,
            )
            queryClient.setQueryData<Collection[]>(
                queryKeys.collections,
                (prev) =>
                    (prev ?? []).map((c) =>
                        c.id === updatedCollection.id ? updatedCollection : c,
                    ),
            )
            return { previousCollections }
        },
        onError: (_err, _collection, context) => {
            queryClient.setQueryData(
                queryKeys.collections,
                context?.previousCollections,
            )
        },
        onSettled: () => {
            invalidateCollectionQueries()
        },
    })

    const hardDeleteCollectionMutation = useMutation({
        mutationFn: async (collection: Collection) => {
            await storage.deleteCollection(collection.id)
        },
        onMutate: async (collection) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.collections })
            const previousCollections = queryClient.getQueryData<Collection[]>(
                queryKeys.collections,
            )
            queryClient.setQueryData<Collection[]>(
                queryKeys.collections,
                (prev) => (prev ?? []).filter((c) => c.id !== collection.id),
            )
            return { previousCollections }
        },
        onError: (_err, _collection, context) => {
            queryClient.setQueryData(
                queryKeys.collections,
                context?.previousCollections,
            )
        },
        onSettled: () => {
            invalidateCollectionQueries()
        },
    })

    const softDeleteCollectionMutation = useMutation({
        mutationFn: async (collection: Collection) => {
            const now = DateTime.now().toISO()
            await storage.putCollection({
                ...collection,
                deletedAt: now,
                updatedAt: now,
            })
        },
        onMutate: async (collection) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.collections })
            const previousCollections = queryClient.getQueryData<Collection[]>(
                queryKeys.collections,
            )
            queryClient.setQueryData<Collection[]>(
                queryKeys.collections,
                (prev) => (prev ?? []).filter((c) => c.id !== collection.id),
            )
            return { previousCollections }
        },
        onError: (_err, _collection, context) => {
            queryClient.setQueryData(
                queryKeys.collections,
                context?.previousCollections,
            )
        },
        onSuccess: () => {
            toast.success("Collection deleted")
        },
        onSettled: () => {
            invalidateCollectionQueries()
        },
    })

    return {
        createCollectionMutation,
        updateCollectionMutation,
        hardDeleteCollectionMutation,
        softDeleteCollectionMutation,
    }
}

'use client'

import { useState, useRef, useEffect } from 'react'

interface Image {
  id: number
  originalName: string
  filename: string
  path: string
  url: string
  mimetype: string
  size: number
  uploadedAt: string
}

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all images on component mount
  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3016/upload/images')
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadStatus({
          type: 'error',
          message: 'Please select an image file',
        })
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setUploadStatus({ type: null, message: '' })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setUploadStatus({
          type: 'error',
          message: 'Please select an image file',
        })
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setUploadStatus({ type: null, message: '' })
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setUploadStatus({ type: null, message: '' })

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('http://localhost:3016/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setUploadStatus({
          type: 'success',
          message: 'Image uploaded successfully!',
        })
        // Refresh the image list
        fetchImages()
        // Clear the form after successful upload
        setTimeout(() => {
          setSelectedFile(null)
          setPreviewUrl(null)
          setUploadStatus({ type: null, message: '' })
        }, 2000)
      } else {
        const error = await response.json()
        setUploadStatus({
          type: 'error',
          message: error.message || 'Upload failed. Please try again.',
        })
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to connect to server. Make sure the backend is running.',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const response = await fetch(`http://localhost:3016/upload/image/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Remove the image from the list
        setImages(images.filter((img) => img.id !== id))
        setUploadStatus({
          type: 'success',
          message: 'Image deleted successfully!',
        })
        setTimeout(() => {
          setUploadStatus({ type: null, message: '' })
        }, 2000)
      } else {
        setUploadStatus({
          type: 'error',
          message: 'Failed to delete image',
        })
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'Failed to connect to server',
      })
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadStatus({ type: null, message: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Image Gallery</h1>
            <p className="text-purple-200">Upload and manage your images</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 sticky top-6">
                <h2 className="text-xl font-semibold text-white mb-4">Upload Image</h2>

                {/* Upload area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                    previewUrl
                      ? 'border-purple-400 bg-purple-500/10'
                      : 'border-purple-300/50 hover:border-purple-400 hover:bg-white/5'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {previewUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-40 rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs text-purple-200 break-all">{selectedFile?.name}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-purple-500/20">
                        <svg
                          className="w-6 h-6 text-purple-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white mb-1">Drop your image here</p>
                        <p className="text-xs text-purple-200">or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status message */}
                {uploadStatus.message && (
                  <div
                    className={`mt-4 p-3 rounded-lg text-xs ${
                      uploadStatus.type === 'success'
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-red-500/20 text-red-200 border border-red-500/30'
                    }`}
                  >
                    {uploadStatus.message}
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-4 flex gap-2">
                  {selectedFile && (
                    <button
                      onClick={handleClear}
                      disabled={uploading}
                      className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/20"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-linear-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Uploading...
                      </span>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Images Grid */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Your Images ({images.length})
                  </h2>
                  <button
                    onClick={fetchImages}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {loading && images.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                    <p className="text-purple-200 mt-4">Loading images...</p>
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-purple-300 opacity-50"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-purple-200 mt-4">No images uploaded yet</p>
                    <p className="text-purple-300 text-sm mt-2">
                      Upload your first image to get started!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all duration-200"
                      >
                        {/* Image */}
                        <div className="aspect-video relative overflow-hidden bg-slate-800">
                          <img
                            src={`http://localhost:3016${image.url}`}
                            alt={image.originalName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>

                        {/* Info */}
                        <div className="p-4">
                          <h3 className="text-white font-medium text-sm truncate mb-2">
                            {image.originalName}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-purple-200">
                            <span>{formatFileSize(image.size)}</span>
                            <span>{formatDate(image.uploadedAt)}</span>
                          </div>

                          {/* Actions */}
                          <div className="mt-3 flex gap-2">
                            <a
                              href={`http://localhost:3016${image.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-all duration-200 text-center"
                            >
                              View
                            </a>
                            <button
                              onClick={() => handleDelete(image.id)}
                              className="flex-1 px-3 py-2 rounded-lg text-xs font-medium bg-red-500/20 text-red-200 hover:bg-red-500/30 transition-all duration-200 border border-red-500/30"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

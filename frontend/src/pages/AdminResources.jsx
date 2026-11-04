
import { useState, useEffect } from 'react';

const AdminResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [location, setLocation] = useState('');
    const [capacity, setCapacity] = useState('');
    const [status, setStatus] = useState('available');

    // Editing state
    const [editingId, setEditingId] = useState(null);

    // Fetch all resources
    const getResources = async () => {
        try {
            const token = localStorage.getItem('jwtToken');

            const response = await fetch(
                'http://localhost:3000/api/resources?limit=100',
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch resources.');
            }

            const data = await response.json();

            setResources(data.resources);
            setError('');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Initial resource fetching
    useEffect(() => {
        getResources();
    }, []);

    // Reset form
    const resetForm = () => {
        setName('');
        setType('');
        setLocation('');
        setCapacity('');
        setStatus('available');
        setEditingId(null);
    };

    // Add a new resource
    const handleAddResource = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('jwtToken');

            const response = await fetch(
                'http://localhost:3000/api/admin/resources',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name,
                        type,
                        location,
                        capacity: Number(capacity)
                    })
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert('Resource added successfully!');

            resetForm();
            await getResources();

        } catch (err) {
            alert(err.message);
        }
    };

    // Select resource for editing
    const handleEditResource = (resource) => {
        setEditingId(resource.id);

        setName(resource.name);
        setType(resource.type);
        setLocation(resource.location);
        setCapacity(String(resource.capacity));
        setStatus(resource.status);
    };

    // Update an existing resource
    const handleUpdateResource = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('jwtToken');

            const response = await fetch(
                `http://localhost:3000/api/admin/resources/${editingId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name,
                        type,
                        location,
                        capacity: Number(capacity),
                        status
                    })
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert('Resource updated successfully!');

            resetForm();
            await getResources();

        } catch (err) {
            alert(err.message);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        if (editingId !== null) {
            handleUpdateResource(e);
        } else {
            handleAddResource(e);
        }
    };

    // Delete a resource
    const handleDeleteResource = async (resourceId) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this resource?'
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const token = localStorage.getItem('jwtToken');

            const response = await fetch(
                `http://localhost:3000/api/admin/resources/${resourceId}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert('Resource deleted successfully!');

            // Reset form if the deleted resource was being edited
            if (editingId === resourceId) {
                resetForm();
            }

            await getResources();

        } catch (err) {
            alert(err.message);
        }
    };

    // Loading state
    if (loading) {
        return <p>Loading resources...</p>;
    }

    // Error state
    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className="admin-resources-page">

            <h2>Resource Management</h2>

            <p>Manage all campus resources from here.</p>

            <p>Total Resources: {resources.length}</p>

            {/* Add / Edit Resource Form */}

            <h3>
                {editingId !== null
                    ? 'Edit Resource'
                    : 'Add New Resource'}
            </h3>

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Resource Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Resource Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                />

                <input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />

                <input
                    type="number"
                    placeholder="Capacity"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    min="1"
                    required
                />

                {editingId !== null && (
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="available">
                            Available
                        </option>

                        <option value="unavailable">
                            Unavailable
                        </option>
                    </select>
                )}

                <button type="submit">
                    {editingId !== null
                        ? 'Update Resource'
                        : 'Add Resource'}
                </button>

                {editingId !== null && (
                    <button
                        type="button"
                        onClick={resetForm}
                    >
                        Cancel Editing
                    </button>
                )}

            </form>

            {/* Display All Resources */}

            <h3>All Resources</h3>

            <div className="resource-list">

                {resources.map((resource) => (

                    <div
                        key={resource.id}
                        className="resource-card"
                    >

                        <h3>{resource.name}</h3>

                        <p>Type: {resource.type}</p>

                        <p>Location: {resource.location}</p>

                        <p>Capacity: {resource.capacity}</p>

                        <p>Status: {resource.status}</p>

                        {/* Edit Button */}

                        <button
                            type="button"
                            onClick={() => handleEditResource(resource)}
                        >
                            Edit
                        </button>

                        {/* Delete Button */}

                        <button
                            type="button"
                            onClick={() => handleDeleteResource(resource.id)}
                        >
                            Delete
                        </button>

                    </div>

                ))}

            </div>

        </div>
    );
};

export default AdminResources;

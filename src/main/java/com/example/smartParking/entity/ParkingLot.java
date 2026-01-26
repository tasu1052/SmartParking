package com.example.smartParking.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class ParkingLot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    String name;

    @Column(nullable = false)
    String location;

    @OneToMany(mappedBy = "parkingLot")
    private List<ParkingSpot> parkingSpots = new ArrayList<>();
}
